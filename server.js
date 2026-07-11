import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  usersContainer,
  ticketsContainer,
  repliesContainer,
  dbReady,
  initializeDatabase
} from './cosmosDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// DB readiness guard: return 503 on API routes if DB is not yet connected
app.use(['/login', '/register', '/tickets'], (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      error: 'Database not yet available. Please ensure COSMOS_ENDPOINT, COSMOS_KEY, and COSMOS_DATABASE are configured in Azure App Service settings, then restart the app.'
    });
  }
  next();
});

// Helper: Query user by ID across partitions
async function getUserById(userId) {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.id = @userId",
    parameters: [{ name: "@userId", value: userId }]
  };
  const { resources } = await usersContainer.items
    .query(querySpec, { enableCrossPartitionQuery: true })
    .fetchAll();
  return resources[0] || null;
}

// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @email AND c.password = @password",
      parameters: [
        { name: "@email", value: email },
        { name: "@password", value: password }
      ]
    };
    const { resources } = await usersContainer.items
      .query(querySpec, { enableCrossPartitionQuery: true })
      .fetchAll();
    const user = resources[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Omit password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /register
app.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Email, password, name, and role are required" });
  }

  try {
    // Check if user already exists
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };
    const { resources } = await usersContainer.items
      .query(querySpec, { enableCrossPartitionQuery: true })
      .fetchAll();
    if (resources.length > 0) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: role === 'admin' ? 'admin' : 'customer'
    };

    const { resource } = await usersContainer.items.create(newUser);
    const { password: _, ...userWithoutPassword } = resource;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tickets
app.get('/tickets', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Missing X-User-Id header." });
  }

  try {
    const requestingUser = await getUserById(userId);
    if (!requestingUser) {
      return res.status(403).json({ error: "Forbidden. Invalid User ID." });
    }

    if (requestingUser.role === 'admin') {
      // Admins see all tickets
      const querySpec = {
        query: "SELECT * FROM c ORDER BY c.createdAt DESC"
      };
      const { resources } = await ticketsContainer.items
        .query(querySpec, { enableCrossPartitionQuery: true })
        .fetchAll();
      res.json(resources);
    } else {
      // Customers see only their own tickets
      const querySpec = {
        query: "SELECT * FROM c WHERE c.customerId = @customerId ORDER BY c.createdAt DESC",
        parameters: [{ name: "@customerId", value: userId }]
      };
      const { resources } = await ticketsContainer.items
        .query(querySpec, { enableCrossPartitionQuery: true })
        .fetchAll();
      res.json(resources);
    }
  } catch (err) {
    console.error("Get tickets error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tickets/:id
app.get('/tickets/:id', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Missing X-User-Id header." });
  }

  try {
    const requestingUser = await getUserById(userId);
    if (!requestingUser) {
      return res.status(403).json({ error: "Forbidden. Invalid User ID." });
    }

    // Query ticket by ID (across partition keys)
    const ticketQuerySpec = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: req.params.id }]
    };
    const { resources: ticketResources } = await ticketsContainer.items
      .query(ticketQuerySpec, { enableCrossPartitionQuery: true })
      .fetchAll();
    const ticket = ticketResources[0];

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Ensure Customer can only see their own ticket
    if (requestingUser.role === 'customer' && ticket.customerId !== userId) {
      return res.status(403).json({ error: "Forbidden. Access to this ticket is denied." });
    }

    // Query replies (partitioned by ticketId)
    const repliesQuerySpec = {
      query: "SELECT * FROM c WHERE c.ticketId = @ticketId ORDER BY c.createdAt ASC",
      parameters: [{ name: "@ticketId", value: ticket.id }]
    };
    const { resources: repliesResources } = await repliesContainer.items
      .query(repliesQuerySpec, { enableCrossPartitionQuery: true })
      .fetchAll();

    res.json({ ticket, replies: repliesResources });
  } catch (err) {
    console.error("Get ticket details error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /tickets
app.post('/tickets', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { title, description, category, priority } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Missing X-User-Id header." });
  }

  try {
    const requestingUser = await getUserById(userId);
    if (!requestingUser || requestingUser.role !== 'customer') {
      return res.status(403).json({ error: "Forbidden. Only customers can create tickets." });
    }

    if (!title || !description || !category || !priority) {
      return res.status(400).json({ error: "Missing required ticket fields" });
    }

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: requestingUser.id,
      customerName: requestingUser.name,
      title,
      description,
      category,
      priority,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    const { resource } = await ticketsContainer.items.create(newTicket);
    res.status(201).json(resource);
  } catch (err) {
    console.error("Create ticket error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /tickets/:id/status
app.patch('/tickets/:id/status', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { status } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Missing X-User-Id header." });
  }

  try {
    const requestingUser = await getUserById(userId);
    if (!requestingUser || requestingUser.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden. Only admins can modify ticket status." });
    }

    if (!status || !['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Query ticket first to get partition key (customerId)
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: req.params.id }]
    };
    const { resources } = await ticketsContainer.items
      .query(querySpec, { enableCrossPartitionQuery: true })
      .fetchAll();
    const ticket = resources[0];

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    ticket.status = status;
    const { resource: updatedTicket } = await ticketsContainer.items.upsert(ticket);
    res.json({ success: true, ticket: updatedTicket });
  } catch (err) {
    console.error("Update ticket status error:", err.code, err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /tickets/:id/reply
app.post('/tickets/:id/reply', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { message } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Missing X-User-Id header." });
  }

  try {
    const requestingUser = await getUserById(userId);
    if (!requestingUser) {
      return res.status(403).json({ error: "Forbidden. Invalid User ID." });
    }

    if (!message) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Query ticket first to check ownership and get customerId
    const querySpec = {
      query: "SELECT * FROM c WHERE c.id = @id",
      parameters: [{ name: "@id", value: req.params.id }]
    };
    const { resources } = await ticketsContainer.items
      .query(querySpec, { enableCrossPartitionQuery: true })
      .fetchAll();
    const ticket = resources[0];

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Ensure Customer can only reply to their own ticket
    if (requestingUser.role === 'customer' && ticket.customerId !== userId) {
      return res.status(403).json({ error: "Forbidden. You cannot reply to this ticket." });
    }

    const newReply = {
      id: `rep-${Date.now()}`,
      ticketId: ticket.id,
      senderId: requestingUser.id,
      senderName: requestingUser.name,
      senderRole: requestingUser.role,
      message,
      createdAt: new Date().toISOString()
    };

    const { resource: createdReply } = await repliesContainer.items.create(newReply);

    // Auto-reopen ticket if a reply is posted on a resolved ticket
    if (ticket.status === 'Resolved') {
      ticket.status = 'In Progress';
      await ticketsContainer.items.upsert(ticket);
    }

    res.status(201).json(createdReply);
  } catch (err) {
    console.error("Create reply error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve React frontend build
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all: serve React app for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server first, then initialize DB
app.listen(PORT, () => {
  console.log(`Backend Server listening at http://localhost:${PORT}`);
});

// Initialize database after server is already listening
initializeDatabase()
  .then(() => {
    console.log('Database ready.');
  })
  .catch((err) => {
    console.error('WARNING: Failed to initialize database. API calls may fail.', err.message);
    // Do NOT exit — keep the server alive to serve the frontend
  });

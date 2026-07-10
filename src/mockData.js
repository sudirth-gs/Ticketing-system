export const initialUsers = [
  {
    id: "cust-1",
    email: "customer@example.com",
    name: "John Customer",
    role: "customer"
  },
  {
    id: "cust-2",
    email: "alice@example.com",
    name: "Alice Miller",
    role: "customer"
  },
  {
    id: "admin-1",
    email: "admin@example.com",
    name: "Sarah Support",
    role: "admin"
  }
];

export const initialTickets = [
  {
    id: "TCK-1001",
    customerId: "cust-1",
    customerName: "John Customer",
    title: "Billing Inquiry - Premium Plan Invoice",
    description: "I noticed a double charge on my invoice for June 2026. Can you please check and refund the duplicate amount? I paid once on the 1st and another charge appeared on the 3rd.",
    category: "Billing",
    priority: "High",
    status: "Open",
    createdAt: "2026-07-08T09:30:00Z"
  },
  {
    id: "TCK-1002",
    customerId: "cust-1",
    customerName: "John Customer",
    title: "API Endpoint returns 500 error",
    description: "The /api/v1/data endpoint is returning a 500 Internal Server Error when querying list results with filters. It blocks our frontend team.",
    category: "Technical",
    priority: "Medium",
    status: "In Progress",
    createdAt: "2026-07-08T14:20:00Z"
  },
  {
    id: "TCK-1003",
    customerId: "cust-2",
    customerName: "Alice Miller",
    title: "Cannot reset security password",
    description: "I am trying to reset my password, but the email OTP is not arriving in my inbox. I checked my spam folder as well.",
    category: "Account",
    priority: "Low",
    status: "Resolved",
    createdAt: "2026-07-07T11:00:00Z"
  }
];

export const initialReplies = [
  {
    id: "rep-1",
    ticketId: "TCK-1002",
    senderId: "cust-1",
    senderName: "John Customer",
    senderRole: "customer",
    message: "Please check this urgently as it's blocking our development team. Here is the request body: { limit: 10, offset: 0, status: 'active' }",
    createdAt: "2026-07-08T14:25:00Z"
  },
  {
    id: "rep-2",
    ticketId: "TCK-1002",
    senderId: "admin-1",
    senderName: "Sarah Support",
    senderRole: "admin",
    message: "Hello John, I'm checking our backend API logs now. It seems to throw a DB null-pointer exception during query parsing. I'm assigning this to the backend team and will update the status to 'In Progress'.",
    createdAt: "2026-07-08T15:10:00Z"
  },
  {
    id: "rep-3",
    ticketId: "TCK-1003",
    senderId: "admin-1",
    senderName: "Sarah Support",
    senderRole: "admin",
    message: "I've manually triggered a password reset link to your primary email address. Please check if you received it.",
    createdAt: "2026-07-07T11:15:00Z"
  },
  {
    id: "rep-4",
    ticketId: "TCK-1003",
    senderId: "cust-2",
    senderName: "Alice Miller",
    senderRole: "customer",
    message: "Got it! Password reset succeeded. Thanks a lot for the quick help!",
    createdAt: "2026-07-07T11:30:00Z"
  }
];

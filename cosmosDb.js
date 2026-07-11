import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

dotenv.config();

// Use exported 'let' so server.js gets live bindings after DB init
export let usersContainer = null;
export let ticketsContainer = null;
export let repliesContainer = null;
export let dbReady = false;

export async function initializeDatabase() {
  const endpoint = process.env.COSMOS_ENDPOINT;
  const key = process.env.COSMOS_KEY;
  const databaseId = process.env.COSMOS_DATABASE;

  if (!endpoint || !key || !databaseId) {
    console.error(
      'WARNING: Missing Cosmos DB environment variables (COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE). ' +
      'The server will run but API routes will return 503 until the variables are configured.'
    );
    return;
  }

  console.log('Initializing Azure Cosmos DB...');

  const client = new CosmosClient({ endpoint, key });
  const database = client.database(databaseId);

  await client.databases.createIfNotExists({ id: databaseId });
  console.log(`  Database "${databaseId}" ready.`);

  await database.containers.createIfNotExists({
    id: 'Users',
    partitionKey: { paths: ['/role'] }
  });
  usersContainer = database.container('Users');
  console.log('  Container "Users" ready.');

  await database.containers.createIfNotExists({
    id: 'Tickets',
    partitionKey: { paths: ['/customerId'] }
  });
  ticketsContainer = database.container('Tickets');
  console.log('  Container "Tickets" ready.');

  await database.containers.createIfNotExists({
    id: 'Replies',
    partitionKey: { paths: ['/ticketId'] }
  });
  repliesContainer = database.container('Replies');
  console.log('  Container "Replies" ready.');

  dbReady = true;
  console.log('Cosmos DB initialization complete.\n');
}

import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE;

if (!endpoint || !key || !databaseId) {
  throw new Error('Missing required environment variables: COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE');
}

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);

// Container references
const usersContainer = database.container('Users');
const ticketsContainer = database.container('Tickets');
const repliesContainer = database.container('Replies');

/**
 * Initialize the Cosmos DB database and containers.
 * Creates them if they don't already exist.
 */
async function initializeDatabase() {
  console.log('Initializing Azure Cosmos DB...');

  // Create database if not exists
  await client.databases.createIfNotExists({ id: databaseId });
  console.log(`  Database "${databaseId}" ready.`);

  // Create containers if not exists with partition keys
  await database.containers.createIfNotExists({
    id: 'Users',
    partitionKey: { paths: ['/role'] }
  });
  console.log('  Container "Users" ready.');

  await database.containers.createIfNotExists({
    id: 'Tickets',
    partitionKey: { paths: ['/customerId'] }
  });
  console.log('  Container "Tickets" ready.');

  await database.containers.createIfNotExists({
    id: 'Replies',
    partitionKey: { paths: ['/ticketId'] }
  });
  console.log('  Container "Replies" ready.');

  console.log('Cosmos DB initialization complete.\n');
}

export {
  usersContainer,
  ticketsContainer,
  repliesContainer,
  initializeDatabase
};

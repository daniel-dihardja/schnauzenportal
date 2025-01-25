import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Establishes a connection to MongoDB and reuses it across API calls.
 * @returns {Promise<Db>} The connected MongoDB database instance.
 */
export async function getDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!process.env.ATLAS_MONGODB_URI || !process.env.DB) {
    throw new Error('Missing MongoDB connection environment variables.');
  }

  client = new MongoClient(process.env.ATLAS_MONGODB_URI);
  await client.connect();
  db = client.db(process.env.DB);
  console.log('Connected to MongoDB');

  return db;
}

import { MongoClient, Db, Collection } from 'mongodb';
import * as dotenv from 'dotenv';
import { Filter, Pet } from './schemas';

// Load environment variables if not in production
if (process.env.ENV !== 'production') {
  dotenv.config();
}

/**
 * A service class that provides functionality for querying pets in MongoDB.
 *
 * This class connects to a MongoDB database and retrieves pets based on optional filters.
 */
export class PetQuery {
  private dbUri: string;
  private dbName: string;
  private collectionName: string;
  private collection: Collection<Pet> | null = null;

  /**
   * Creates an instance of the PetQuery class.
   * Initializes environment variables.
   */
  constructor() {
    this.dbUri = process.env.ATLAS_MONGODB_URI as string;
    this.dbName = process.env.DB as string;
    this.collectionName = process.env.COLLECTION as string;
  }

  /**
   * Lazily initializes and retrieves the MongoDB collection.
   * Ensures that the database connection is only established when needed.
   *
   * @returns {Promise<Collection<Pet>>} The MongoDB collection instance.
   */
  private async getCollection(): Promise<Collection<Pet>> {
    if (!this.collection) {
      const client = new MongoClient(this.dbUri);
      await client.connect();
      const db: Db = client.db(this.dbName);
      this.collection = db.collection<Pet>(this.collectionName);
    }
    return this.collection;
  }

  /**
   * Retrieves all pets from the MongoDB collection with optional filtering.
   *
   * @param {Filter} filterObj - Optional filter object to refine results.
   * @returns {Promise<Pet[]>} A promise that resolves to an array of pets.
   */
  public async getAllPets(filterObj: Filter = {}): Promise<Pet[]> {
    const collection = await this.getCollection();

    // Find all pets with optional filtering
    const cursor = collection.find(filterObj);
    const results: Pet[] = [];

    for await (const doc of cursor) {
      results.push(doc);
    }

    return results;
  }
}

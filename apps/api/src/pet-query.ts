import { MongoClient, Db, Collection } from 'mongodb';
import * as dotenv from 'dotenv';
import { Filter, Pet } from './schemas';

if (process.env.ENV !== 'production') {
  dotenv.config();
}

/**
 * A service class for querying pets in MongoDB with pagination support.
 */
export class PetQuery {
  private dbUri: string;
  private dbName: string;
  private collectionName: string;
  private collection: Collection<Pet> | null = null;

  constructor() {
    this.dbUri = process.env.ATLAS_MONGODB_URI as string;
    this.dbName = process.env.DB as string;
    this.collectionName = process.env.COLLECTION as string;
  }

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
   * Retrieves pets with pagination support.
   *
   * @param {Filter} filterObj - Optional filter object.
   * @param {number} limit - Number of results per request.
   * @param {number} skip - Number of results to skip (for pagination).
   * @returns {Promise<Pet[]>} A list of paginated pets.
   */
  public async getAllPets(
    filterObj: Filter = {},
    limit = 10,
    skip = 0
  ): Promise<Pet[]> {
    const collection = await this.getCollection();

    const cursor = collection
      .find(filterObj, { projection: { embedding: 0 } }) // Exclude "embedding"
      .limit(limit)
      .skip(skip);

    const results: Pet[] = [];
    for await (const doc of cursor) {
      results.push(doc);
    }

    return results;
  }
}

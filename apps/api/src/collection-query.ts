import { Db, Collection, Filter } from 'mongodb';
import { getDatabase } from './db'; // Import shared connection

/**
 * A generic service class for querying MongoDB collections with pagination and filtering.
 */
export class CollectionQuery {
  private async getCollection<T>(
    collectionName: string
  ): Promise<Collection<T>> {
    const db: Db = await getDatabase(); // Use shared connection
    return db.collection<T>(collectionName);
  }

  /**
   * Retrieves documents from a specified collection with pagination and filtering.
   *
   * @param collectionName - The name of the collection to query.
   * @param filterObj - Optional filter object.
   * @param limit - The maximum number of results to return (default: `9`).
   * @param skip - The number of results to skip for pagination (default: `0`).
   * @returns A paginated response containing documents and metadata.
   */
  public async findDocuments<T>(
    collectionName: string,
    filterObj: Filter<T> = {},
    limit = 9,
    skip = 0
  ): Promise<{ total: number; skip: number; limit: number; results: T[] }> {
    const collection = await this.getCollection<T>(collectionName);

    const total = await collection.countDocuments(filterObj);
    const cursor = collection
      .find(filterObj, { projection: { embedding: 0 } })
      .limit(limit)
      .skip(skip);

    const results: T[] = [];
    for await (const doc of cursor) {
      results.push(doc as unknown as T);
    }

    return { total, skip, limit, results };
  }
}

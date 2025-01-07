import { MongoClient, Db, Collection } from 'mongodb';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import { Filter, Pet } from './schemas';

// Load environment variables if not in production
if (process.env.ENV !== 'production') {
  dotenv.config();
}

export class PetVectorSearch {
  private dbUri: string;
  private dbName: string;
  private collectionName: string;
  private vectorSearchIndex: string;
  private openaiClient: OpenAI;
  private collection: Collection | null = null;

  constructor() {
    this.dbUri = process.env.ATLAS_MONGODB_URI as string;
    this.dbName = process.env.DB as string;
    this.collectionName = process.env.COLLECTION as string;
    this.vectorSearchIndex = process.env.VECTOR_SEARCH_INDEX_NAME as string;

    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Lazily initialize and return the MongoDB collection
  private async getCollection(): Promise<Collection> {
    if (!this.collection) {
      const client = new MongoClient(this.dbUri);
      await client.connect();
      const db: Db = client.db(this.dbName);
      this.collection = db.collection(this.collectionName);
    }
    return this.collection;
  }

  // Generate embeddings asynchronously using OpenAI API
  private async getGptEmbeddings(text: string): Promise<number[]> {
    const response = await this.openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Perform vector search for pets
  public async searchPets(query: string, filterObj: Filter): Promise<Pet[]> {
    const collection = await this.getCollection();
    const queryEmbedding = await this.getGptEmbeddings(query);

    // Build the vector search pipeline
    const pipeline = [
      {
        $vectorSearch: {
          queryVector: queryEmbedding,
          path: 'embedding',
          index: this.vectorSearchIndex,
          numCandidates: 10,
          limit: 3,
          filter: filterObj || {},
        },
      },
      { $set: { score: { $meta: 'vectorSearchScore' } } },
      {
        $project: {
          id: { $toString: '$_id' },
          type: 1,
          name: 1,
          breed: 1,
          gender: 1,
          neutered: 1,
          birth_year: 1,
          image: 1,
          url: 1,
          text: 1,
        },
      },
    ];

    // Execute the aggregation pipeline asynchronously
    const cursor = collection.aggregate<Pet>(pipeline);
    const results: Pet[] = [];
    for await (const doc of cursor) {
      results.push(doc);
    }

    return results;
  }
}

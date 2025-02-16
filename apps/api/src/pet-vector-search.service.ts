import { MongoClient, Db, Collection } from 'mongodb';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import { Filter, Pet } from './schemas';

// Load environment variables if not in production
if (process.env.ENV !== 'production') {
  dotenv.config();
}

/**
 * A service class that provides functionality for searching pets using vector search and OpenAI embeddings.
 *
 * This class connects to a MongoDB database, generates text embeddings using the OpenAI API, and
 * performs vector-based search queries to find matching pets based on user input and filters.
 */
export class PetVectorSearch {
  private dbUri: string;
  private dbName: string;
  private collectionName: string;
  private vectorSearchIndex: string;
  private openaiClient: OpenAI;
  private collection: Collection | null = null;

  /**
   * Creates an instance of the PetVectorSearch class.
   * Initializes environment variables and sets up the OpenAI client.
   */
  constructor() {
    this.dbUri = process.env.ATLAS_MONGODB_URI as string;
    this.dbName = process.env.DB as string;
    this.collectionName = process.env.COLLECTION as string;
    this.vectorSearchIndex = process.env.VECTOR_SEARCH_INDEX_NAME as string;

    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Lazily initializes and retrieves the MongoDB collection.
   * Ensures that the database connection is only established when needed.
   *
   * @returns {Promise<Collection>} The MongoDB collection instance.
   */
  private async getCollection(): Promise<Collection> {
    if (!this.collection) {
      const client = new MongoClient(this.dbUri);
      await client.connect();
      const db: Db = client.db(this.dbName);
      this.collection = db.collection(this.collectionName);
    }
    return this.collection;
  }

  /**
   * Generates vector embeddings for the given text using the OpenAI API.
   *
   * @param {string} text - The input text to generate embeddings for.
   * @returns {Promise<number[]>} A promise that resolves to the embedding vector.
   */
  private async getGptEmbeddings(text: string): Promise<number[]> {
    const response = await this.openaiClient.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  /**
   * Performs a vector search for pets based on a user query and optional filter criteria.
   *
   * @param {string} query - The user query describing the pet.
   * @param {Filter} filterObj - An optional filter object for additional search constraints.
   * @returns {Promise<Pet[]>} A promise that resolves to an array of matching pets.
   */
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
          limit: 10,
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

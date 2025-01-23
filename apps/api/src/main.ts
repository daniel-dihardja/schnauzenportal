import { HumanMessage } from '@langchain/core/messages';
import express from 'express';
import { graph } from './agent';
import { PetQuery } from './pet-query'; // Import PetQuery class
import { Filter } from './schemas';

const app = express();
app.use(express.json()); // For parsing JSON payloads
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded payloads

const petQuery = new PetQuery(); // Initialize petQuery instance

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Schnauzenportal' });
});

// Search API using LangChain agent
app.post('/search', async (req, res) => {
  try {
    const message = req.body.message;
    const msg = new HumanMessage({ content: message });
    const result = await graph.invoke({ messages: [msg] });
    res.json(result.response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing search request' });
  }
});

// Browse API - Retrieves a list of pets with optional filtering
app.get('/browse', async (req, res) => {
  try {
    console.log('Raw query params:', req.query); // Debug log

    // Convert query params safely (ensure they are numbers)
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 9;
    const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;

    console.log(`Parsed values - Limit: ${limit}, Skip: ${skip}`); // Debug log

    // Define filters explicitly (avoid passing raw query params)
    const filter: Filter = {};
    if (req.query.type) filter.type = req.query.type as string;

    // Fetch paginated pets
    const pets = await petQuery.getAllPets(filter, limit, skip);
    res.json(pets);
  } catch (error) {
    console.error('Error retrieving pets:', error);
    res.status(500).json({ error: 'Error retrieving pets' });
  }
});

// Start server
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

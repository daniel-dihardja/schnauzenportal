import { HumanMessage } from '@langchain/core/messages';
import express from 'express';
import { graph } from './agent';
import { PetQuery } from './petQuery'; // Import PetQuery class

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
    const filter = req.query as any; // Extract query parameters
    const pets = await petQuery.getAllPets(filter);
    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving pets' });
  }
});

// Start server
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

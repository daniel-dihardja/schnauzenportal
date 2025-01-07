import { HumanMessage } from '@langchain/core/messages';
import express from 'express';
import { graph } from './agent';

const app = express();
app.use(express.json()); // For parsing JSON payloads
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded payloads

app.get('/', (req, res) => {
  res.send('Schnauzenportal');
});

app.post('/search', async (req, res) => {
  const message = req.body.message;
  const msg = new HumanMessage({ content: message });
  const result = await graph.invoke({ messages: [msg] });
  res.json(result);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

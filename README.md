# PetQuery AI Agent 🐾

**PetQuery** is an intelligent, multilingual AI agent designed to help users find adoptable pets using natural language input. Built with [LangChain](https://github.com/langchain-ai/langchain) and [LangGraph](https://github.com/langchain-ai/langgraph), the agent translates user queries, understands intent, extracts search filters, and performs vector-based pet retrieval — all through a structured LLM-powered workflow.

## 🧠 What it does

- Detects the language of user messages and translates them to German (if needed)
- Identifies whether the message is about searching for a pet
- Extracts structured filters (e.g. type, size, age) from natural language using an LLM
- Searches a pet database using a hybrid of semantic vector search and filters
- Composes a localized response suggesting suitable pets to adopt
- Handles multilingual input and provides fallback messages when appropriate

## 🔁 Workflow Overview

The app defines a LangGraph state machine that processes messages through the following steps:

1. **Language Detection**
2. **Translation to German (if necessary)**
3. **Intent Classification** – is the user looking for a pet?
4. **Filter Extraction** – extract structured criteria using an LLM
5. **Vector Search** – retrieve matching pets from MongoDB Atlas using embeddings
6. **Response Composition** – generate a useful reply (general + pet-specific)
7. **Fallback Handling** – if intent or language can't be understood

## 🧩 Core Components

- `LlmService` — wraps language-related tasks: detection, translation, classification, and answer composition via OpenAI
- `PetVectorSearch` — performs vector similarity searches on pet listings
- `StateAnnotation` — defines the tracked state: messages, language, filters, pets, and final response
- `workflowFactory` — builds the graph with all logic nodes and transitions
- `graph` — the compiled state graph ready to be executed

## 🛠️ Tech Stack

- **LangChain** & **LangGraph** — for stateful agent logic
- **Node.js** (TypeScript) — core application logic
- **MongoDB Atlas** — stores vectorized pet listings
- **Embeddings** — for semantic search of pet descriptions

## 🗣️ Languages

- Handles input in multiple languages
- Translates everything to German for consistency in retrieval
- Generates responses in the original input language

## 📦 Future Extensions

- Connect to real-time pet listings from more shelters
- Support for advanced filters (location radius, breed, temperament)
- Add UI frontend and public API for integration

---

> Demo: [https://petquery.b3ning.com](https://petquery.b3ning.com)

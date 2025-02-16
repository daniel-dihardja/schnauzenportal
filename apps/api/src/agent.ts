import { ChatOpenAI } from '@langchain/openai';
import { Annotation, StateGraph } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { Filter, Pet, ResponseType } from './schemas';
import {
  COMPOSE_RESPONSE_PROMPT,
  DETECT_LANGUAGE_PROMPT,
  EXTRACT_FILTER_VALUES_PROMPT,
  TRANSLATE_USER_QUERY_PROMPT,
} from './prompt-templates';
import { PromptTemplate } from '@langchain/core/prompts';
import { PetVectorSearch } from './vector-search';

// Define the state structure for annotations
export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) =>
      left.concat(Array.isArray(right) ? right : [right]),
    default: () => [],
  }),
  lang: Annotation<string>({
    value: (current, update) => update,
    default: () => 'de',
  }),
  translatedMessage: Annotation<string>({
    value: (current, update) => update,
    default: () => '',
  }),
  filter: Annotation<Filter>({
    value: (current, update) => update,
    default: () => ({}),
  }),
  pets: Annotation<Pet[] | null>({
    value: (current, update) => update,
    default: () => null,
  }),
  response: Annotation<ResponseType | null>({
    value: (current, update) => update,
    default: () => null,
  }),
});

/**
 * Detects the language of the most recent user message in the state.
 *
 * @param {typeof StateAnnotation.State} state - The current state containing user messages.
 * @param {ChatOpenAI} llm - The LLM service used for language detection.
 * @returns {Promise<{ lang: string }>} The detected language.
 */
export const detectLanguage = async (
  state: typeof StateAnnotation.State,
  llm: ChatOpenAI
): Promise<{ lang: string }> => {
  const promptTemplate = PromptTemplate.fromTemplate(DETECT_LANGUAGE_PROMPT);
  const chain = promptTemplate.pipe(llm);

  const lastMessageContent = state.messages[state.messages.length - 1].content;
  const contentString = Array.isArray(lastMessageContent)
    ? lastMessageContent.map((item) => JSON.stringify(item)).join(' ')
    : String(lastMessageContent);

  const res = await chain.invoke({ message: contentString });
  return { lang: res.content.toString() };
};

/**
 * Translates the user's message to German if necessary.
 *
 * @param {typeof StateAnnotation.State} state - The current state containing user messages and detected language.
 * @param {ChatOpenAI} llm - The LLM service used for translation.
 * @returns {Promise<{ translatedMessage: string }>} The translated message in German.
 */
export const translateMessage = async (
  state: typeof StateAnnotation.State,
  llm: ChatOpenAI
): Promise<{ translatedMessage: string }> => {
  if (state.lang === 'de') {
    return {
      translatedMessage:
        state.messages[state.messages.length - 1].content.toString(),
    };
  }
  const promptTemplate = PromptTemplate.fromTemplate(
    TRANSLATE_USER_QUERY_PROMPT
  );
  const chain = promptTemplate.pipe(llm);
  const res = await chain.invoke({
    message: state.messages[state.messages.length - 1].content,
    lang: state.lang,
  });
  return { translatedMessage: res.content.toString() };
};

/**
 * Extracts filter values from the user's translated message.
 *
 * @param {typeof StateAnnotation.State} state - The current state containing the translated message.
 * @param {ChatOpenAI} llm - The LLM service used for extracting filters.
 * @returns {Promise<{ filter: Filter }>} The extracted filter values.
 */
export const extractFilterValues = async (
  state: typeof StateAnnotation.State,
  llm: ChatOpenAI
): Promise<{ filter: Filter }> => {
  const promptTemplate = PromptTemplate.fromTemplate(
    EXTRACT_FILTER_VALUES_PROMPT
  );
  const chain = promptTemplate.pipe(llm);
  try {
    const res = await chain.invoke({ message: state.translatedMessage });
    return { filter: JSON.parse(res.content.toString()) };
  } catch (error) {
    console.error('Failed to parse filter values:', error);
    return { filter: { type: null } };
  }
};

/**
 * Performs a vector query to find matching pets based on the user's translated message and filter.
 *
 * @param {typeof StateAnnotation.State} state - The current state containing the translated message and filters.
 * @param {PetVectorSearch} petVectorSearch - The vector search service used for retrieving pet data.
 * @returns {Promise<{ pets: Pet[] }>} A list of matching pets or an empty list if none are found.
 */
export const vectorQuery = async (
  state: typeof StateAnnotation.State,
  petVectorSearch: PetVectorSearch
): Promise<{ pets: Pet[] }> => {
  try {
    const query = state.translatedMessage;
    const filter = state.filter;
    return { pets: await petVectorSearch.searchPets(query, filter) };
  } catch (error) {
    console.error('Vector search failed:', error);
    return { pets: [] };
  }
};

/**
 * Composes a response to the user based on the language, message, and pet search results.
 *
 * @param {typeof StateAnnotation.State} state - The current state containing search results.
 * @param {ChatOpenAI} llm - The LLM service used for generating a response.
 * @returns {Promise<{ response: ResponseType }>} The response containing a general answer and pet-specific answers.
 */
export const composeAnswer = async (
  state: typeof StateAnnotation.State,
  llm: ChatOpenAI
): Promise<{ response: ResponseType }> => {
  const lang = state.lang;
  const pets = state.pets;
  const message = state.messages[state.messages.length - 1].content;
  const promptTemplate = PromptTemplate.fromTemplate(COMPOSE_RESPONSE_PROMPT);
  const chain = promptTemplate.pipe(llm);

  try {
    const res = await chain.invoke({ lang, message, pets });
    return { response: JSON.parse(res.content.toString()) };
  } catch (error) {
    console.error('Failed to generate response:', error);
    return {
      response: {
        generalAnswer:
          'Es gab ein Problem bei der Verarbeitung deiner Anfrage. Bitte versuche es erneut.',
        individualPetAnswers: [],
      },
    };
  }
};

/**
 * Creates a LangGraph workflow with injected dependencies.
 *
 * @param {ChatOpenAI} llm - The LLM service to use.
 * @param {PetVectorSearch} petVectorSearch - The vector search service to use.
 * @returns {StateGraph} The configured LangGraph workflow.
 */
export const workflowFactory = (
  llm: ChatOpenAI,
  petVectorSearch: PetVectorSearch
) =>
  new StateGraph(StateAnnotation)
    .addNode('detectLanguage', (state) => detectLanguage(state, llm))
    .addNode('translateMessage', (state) => translateMessage(state, llm))
    .addNode('extractFilterValues', (state) => extractFilterValues(state, llm))
    .addNode('vectorQuery', (state) => vectorQuery(state, petVectorSearch))
    .addNode('composeAnswer', (state) => composeAnswer(state, llm))
    .addEdge('__start__', 'detectLanguage')
    .addEdge('detectLanguage', 'translateMessage')
    .addEdge('translateMessage', 'extractFilterValues')
    .addEdge('extractFilterValues', 'vectorQuery')
    .addEdge('vectorQuery', 'composeAnswer')
    .addEdge('composeAnswer', '__end__');

/**
 * Initializes the LLM service with a predefined model and temperature.
 */
const llm = new ChatOpenAI({ temperature: 0.5, modelName: 'gpt-3.5-turbo' });

/**
 * Initializes the vector search service for retrieving pet data.
 */
const petVectorSearch = new PetVectorSearch();

/**
 * The compiled graph representing the workflow for processing user queries.
 */
export const graph = workflowFactory(llm, petVectorSearch).compile({});

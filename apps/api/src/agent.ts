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
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (left: BaseMessage[], right: BaseMessage | BaseMessage[]) => {
      if (Array.isArray(right)) {
        return left.concat(right);
      }
      return left.concat([right]);
    },
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
 * Creates an instance of ChatOpenAI with predefined configuration.
 */
const createLLM = (): ChatOpenAI =>
  new ChatOpenAI({
    temperature: 0.5,
    modelName: 'gpt-3.5-turbo',
  });

/**
 * Detects the language of the most recent user message in the state.
 * @param state - The state object containing user messages.
 * @returns The detected language.
 */
const detectLanguage = async (
  state: typeof StateAnnotation.State
): Promise<{ lang: string }> => {
  const llm = createLLM();
  const promptTemplate = PromptTemplate.fromTemplate(DETECT_LANGUAGE_PROMPT);
  const chain = promptTemplate.pipe(llm);

  // Convert content to a string if necessary
  const lastMessageContent = state.messages[state.messages.length - 1].content;
  const contentString = Array.isArray(lastMessageContent)
    ? lastMessageContent.map((item) => JSON.stringify(item)).join(' ')
    : String(lastMessageContent);

  const res = await chain.invoke({ message: contentString });
  return { lang: res.content.toString() };
};

/**
 * Translates the user's message to German if necessary.
 * @param state - The state object containing user messages and language.
 * @returns The translated message.
 */
const translateMessage = async (
  state: typeof StateAnnotation.State
): Promise<{ translatedMessage: string }> => {
  if (state.lang === 'de') {
    return {
      translatedMessage:
        state.messages[state.messages.length - 1].content.toString(),
    };
  }
  const llm = createLLM();
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
 * @param state - The state object containing the translated message.
 * @returns The extracted filter values.
 */
const extractFilterValues = async (
  state: typeof StateAnnotation.State
): Promise<{ filter: Filter }> => {
  const llm = createLLM();
  const promptTemplate = PromptTemplate.fromTemplate(
    EXTRACT_FILTER_VALUES_PROMPT
  );
  const chain = promptTemplate.pipe(llm);
  const res = await chain.invoke({
    message: state.translatedMessage,
  });
  return { filter: JSON.parse(res.content.toString()) };
};

/**
 * Performs a vector query to find matching pets based on the user's translated message and filter.
 * @param state - The state object containing the query and filter.
 * @returns The search results.
 */
const vectorQuery = async (
  state: typeof StateAnnotation.State
): Promise<{ pets: Pet[] }> => {
  const query = state.translatedMessage;
  const filter = state.filter;
  const vs = new PetVectorSearch();
  const pets = await vs.searchPets(query, filter);
  return { pets };
};

/**
 * Composes a response to the user based on the language, message, and pet search results.
 * @param state - The state object containing context and search results.
 * @returns The composed response.
 */
const composeAnswer = async (
  state: typeof StateAnnotation.State
): Promise<{ response: ResponseType }> => {
  const lang = state.lang;
  const pets = state.pets;
  const message = state.messages[state.messages.length - 1].content;
  const llm = createLLM();
  const promptTemplate = PromptTemplate.fromTemplate(COMPOSE_RESPONSE_PROMPT);
  const chain = promptTemplate.pipe(llm);
  const res = await chain.invoke({
    lang,
    message,
    pets,
  });
  return { response: JSON.parse(res.content.toString()) };
};

/**
 * Defines a state graph workflow to process user queries through various stages.
 */
const workflow = new StateGraph(StateAnnotation)
  .addNode('detectLanguage', detectLanguage)
  .addNode('translateMessage', translateMessage)
  .addNode('extractFilterValues', extractFilterValues)
  .addNode('vectorQuery', vectorQuery)
  .addNode('composeAnswer', composeAnswer)
  .addEdge('__start__', 'detectLanguage')
  .addEdge('detectLanguage', 'translateMessage')
  .addEdge('translateMessage', 'extractFilterValues')
  .addEdge('extractFilterValues', 'vectorQuery')
  .addEdge('vectorQuery', 'composeAnswer')
  .addEdge('composeAnswer', '__end__');

/**
 * The compiled graph representing the workflow for processing user queries.
 */
export const graph = workflow.compile({});

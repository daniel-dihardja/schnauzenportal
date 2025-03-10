import { Annotation, StateGraph } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { Filter, Pet, ResponseType } from './schemas';
import { PetVectorSearch } from './pet-vector-search.service';
import { LlmService } from './llm.service';

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
  isLookingForPet: Annotation<boolean>({
    value: (current, update) => update,
    default: () => false,
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
  llmService: LlmService
): Promise<{ lang: string }> => {
  const message = state.messages[state.messages.length - 1].content;
  const res = await llmService.detectLanguage(message);
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
  llmService: LlmService
): Promise<{ translatedMessage: string }> => {
  if (state.lang === 'de') {
    return {
      translatedMessage:
        state.messages[state.messages.length - 1].content.toString(),
    };
  }
  const message = state.messages[state.messages.length - 1].content;
  const res = await llmService.translateMessage(message, state.lang);

  return { translatedMessage: res.content.toString() };
};

/**
 * Determines if the user's message is about looking for a pet.
 *
 * @param {typeof StateAnnotation.State} state - The current state containing the translated message.
 * @param {LlmService} llmService - The LLM service used for classification.
 * @returns {Promise<{ isLookingForPet: boolean }>} True if the message is about looking for a pet.
 */
export const checkIfLookingForPet = async (
  state: typeof StateAnnotation.State,
  llmService: LlmService
): Promise<{ isLookingForPet: boolean }> => {
  const message = state.translatedMessage;
  const res = await llmService.isLookingForPet(message);
  return { isLookingForPet: res.content.toString() === 'true' };
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
  llmService: LlmService
): Promise<{ filter: Filter }> => {
  const res = await llmService.extractFilterValues(state.translatedMessage);
  try {
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
  llmService: LlmService
): Promise<{ response: ResponseType }> => {
  const lang = state.lang;
  const pets = state.pets;
  const message = state.messages[state.messages.length - 1].content;
  const res = await llmService.composeAnswer(message, lang, pets);
  try {
    return { response: JSON.parse(res.content.toString()) };
  } catch (error) {
    console.error('Failed to generate response:', error);
    return {
      response: {
        generalAnswer:
          'There was a problem processing your request. Please try again.',
        individualPetAnswers: [],
      },
    };
  }
};

/**
 * Handles cases where the language could not be detected.
 *
 * @param {typeof StateAnnotation.State} state - The current state.
 * @returns {Promise<{ response: ResponseType }>} The fallback response.
 */
export const fallbackUnknownLanguage = async (): Promise<{
  response: ResponseType;
}> => {
  return {
    response: {
      generalAnswer:
        "I'm sorry, but I couldn't detect the language of your message.",
      individualPetAnswers: [],
    },
  };
};

/**
 * Determines the next node based on language detection.
 *
 * @param {typeof StateAnnotation.State} state - The current state.
 * @returns {string} The next node name.
 */
const getNextNodeForLanguageDetection = (
  state: typeof StateAnnotation.State
): string => {
  return state.lang === 'unknown'
    ? 'fallbackUnknownLanguage'
    : 'translateMessage';
};

/**
 * Determines the next node based on whether the user is looking for a pet.
 *
 * @param {typeof StateAnnotation.State} state - The current state containing the translated message.
 * @returns {string} The next node in the workflow.
 *
 * Possible Returns:
 * - 'extractFilterValues' → If the message is about looking for a pet.
 * - 'fallbackNotLookingForPet' → If the message is unrelated to pet adoption.
 */
export const getNextNodeForPetSearch = (
  state: typeof StateAnnotation.State
): string => {
  return state.isLookingForPet
    ? 'extractFilterValues'
    : 'fallbackNotLookingForPet';
};

/**
 * Handles cases where the user's message is not about looking for a pet.
 *
 * @returns {Promise<{ response: ResponseType }>} The fallback response.
 */
export const fallbackNotLookingForPet = async (): Promise<{
  response: ResponseType;
}> => {
  return {
    response: {
      generalAnswer:
        'I can help you find a pet to adopt! Currently, you can search for dogs or cats.',
      individualPetAnswers: [],
    },
  };
};

export const workflowFactory = (
  llmService: LlmService,
  petVectorSearch: PetVectorSearch
) =>
  new StateGraph(StateAnnotation)
    .addNode('detectLanguage', (state) => detectLanguage(state, llmService))
    .addNode('translateMessage', (state) => translateMessage(state, llmService))
    .addNode('checkIfLookingForPet', (state) =>
      checkIfLookingForPet(state, llmService)
    )
    .addNode('extractFilterValues', (state) =>
      extractFilterValues(state, llmService)
    )
    .addNode('vectorQuery', (state) => vectorQuery(state, petVectorSearch))
    .addNode('composeAnswer', (state) => composeAnswer(state, llmService))
    .addNode('fallbackUnknownLanguage', () => fallbackUnknownLanguage())
    .addNode('fallbackNotLookingForPet', () => fallbackNotLookingForPet())
    // Define start
    .addEdge('__start__', 'detectLanguage')

    // Use extracted function for Conditional Edge
    .addConditionalEdges('detectLanguage', getNextNodeForLanguageDetection, {
      fallbackUnknownLanguage: 'fallbackUnknownLanguage',
      translateMessage: 'translateMessage',
    })

    // Continue normal processing
    .addEdge('translateMessage', 'checkIfLookingForPet')
    .addConditionalEdges('checkIfLookingForPet', getNextNodeForPetSearch, {
      extractFilterValues: 'extractFilterValues',
      fallbackNotLookingForPet: 'fallbackNotLookingForPet',
    })

    .addEdge('extractFilterValues', 'vectorQuery')
    .addEdge('vectorQuery', 'composeAnswer')

    // Ensure fallback node ends the process
    .addEdge('fallbackUnknownLanguage', '__end__')
    .addEdge('fallbackNotLookingForPet', '__end__')
    .addEdge('composeAnswer', '__end__');

/**
 * Initializes the LLM service for handling language processing tasks.
 */
const llmService = new LlmService();

/**
 * Initializes the vector search service for retrieving pet data.
 */
const petVectorSearch = new PetVectorSearch();

/**
 * The compiled graph representing the workflow for processing user queries.
 */
export const graph = workflowFactory(llmService, petVectorSearch).compile();

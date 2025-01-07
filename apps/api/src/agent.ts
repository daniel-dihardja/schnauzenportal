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

function createLLM(): ChatOpenAI {
  return new ChatOpenAI({
    temperature: 0.5,
    modelName: 'gpt-3.5-turbo',
  });
}

const detectLanguage = async (state: typeof StateAnnotation.State) => {
  const llm = createLLM();
  const promptTemplate = PromptTemplate.fromTemplate(DETECT_LANGUAGE_PROMPT);
  const chain = promptTemplate.pipe(llm);
  const res = await chain.invoke({
    message: state.messages[state.messages.length - 1].content,
  });
  return { lang: res.content };
};

const translateMessage = async (state: typeof StateAnnotation.State) => {
  if (state.lang === 'de') {
    return {
      translatedMessage: state.messages[state.messages.length - 1].content,
    };
  }
  const llm = createLLM();
  const promptTemplate = PromptTemplate.fromTemplate(
    TRANSLATE_USER_QUERY_PROMPT
  );
  const chain = promptTemplate.pipe(llm);
  const res = await chain.invoke({
    message: state.messages[state.messages.length - 1],
    lang: state.lang,
  });
  return { translatedMessage: res.content };
};

const extractFilterValues = async (state: typeof StateAnnotation.State) => {
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

const vectorQuery = async (state: typeof StateAnnotation.State) => {
  const query = state.translatedMessage;
  const filter = state.filter;
  const vs = new PetVectorSearch();
  const pets = await vs.searchPets(query, filter);
  return { pets };
};

const composeAnswer = async (state: typeof StateAnnotation.State) => {
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

export const graph = workflow.compile({});

import { AIMessageChunk, MessageContent } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import {
  DETECT_LANGUAGE_PROMPT,
  TRANSLATE_USER_QUERY_PROMPT,
  EXTRACT_FILTER_VALUES_PROMPT,
  COMPOSE_RESPONSE_PROMPT,
} from './prompt-templates';
import { PromptTemplate } from '@langchain/core/prompts';
import { Pet } from './schemas';

export class LlmService {
  private llm: ChatOpenAI;

  constructor(llm?: ChatOpenAI) {
    this.llm =
      llm ??
      new ChatOpenAI({
        temperature: 0.5,
        modelName: 'gpt-3.5-turbo',
      });
  }

  async detectLanguage(message: MessageContent): Promise<AIMessageChunk> {
    const promptTemplate = PromptTemplate.fromTemplate(DETECT_LANGUAGE_PROMPT);
    const chain = promptTemplate.pipe(this.llm);
    return chain.invoke({ message });
  }

  async translateMessage(
    message: MessageContent,
    lang: string
  ): Promise<AIMessageChunk> {
    const promptTemplate = PromptTemplate.fromTemplate(
      TRANSLATE_USER_QUERY_PROMPT
    );
    const chain = promptTemplate.pipe(this.llm);
    return chain.invoke({ message, lang });
  }

  async extractFilterValues(message: MessageContent): Promise<AIMessageChunk> {
    const promptTemplate = PromptTemplate.fromTemplate(
      EXTRACT_FILTER_VALUES_PROMPT
    );
    const chain = promptTemplate.pipe(this.llm);
    return chain.invoke({ message });
  }

  async composeAnswer(
    message: MessageContent,
    lang: string,
    pets: Pet[]
  ): Promise<AIMessageChunk> {
    const promptTemplate = PromptTemplate.fromTemplate(COMPOSE_RESPONSE_PROMPT);
    const chain = promptTemplate.pipe(this.llm);
    return chain.invoke({ message, lang, pets });
  }
}

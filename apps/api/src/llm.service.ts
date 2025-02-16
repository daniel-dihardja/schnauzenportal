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

/**
 * LlmService handles interactions with the ChatOpenAI model,
 * providing functionality such as language detection, translation,
 * extracting filters, and composing responses.
 *
 * This class abstracts the LLM usage for easier dependency injection and testing.
 */
export class LlmService {
  /**
   * Initializes the LLM service.
   *
   * @param {ChatOpenAI} [llm] - An optional custom ChatOpenAI instance.
   * If not provided, a default instance with `gpt-3.5-turbo` and temperature `0.5` is used.
   */
  constructor(private llm?: ChatOpenAI) {
    this.llm =
      llm ??
      new ChatOpenAI({
        temperature: 0.5,
        modelName: 'gpt-3.5-turbo',
      });
  }

  /**
   * Detects the language of the given user message.
   *
   * @param {MessageContent} message - The input message to analyze.
   * @returns {Promise<AIMessageChunk>} The detected language in a structured response.
   */
  async detectLanguage(message: MessageContent): Promise<AIMessageChunk> {
    const promptTemplate = PromptTemplate.fromTemplate(DETECT_LANGUAGE_PROMPT);
    const chain = promptTemplate.pipe(this.llm);
    return chain.invoke({ message });
  }

  /**
   * Translates a given message into a target language.
   *
   * @param {MessageContent} message - The message to be translated.
   * @param {string} lang - The target language (e.g., "de" for German, "en" for English).
   * @returns {Promise<AIMessageChunk>} The translated message.
   */
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

  /**
   * Extracts filter values from a user's message,
   * identifying relevant search criteria such as pet type.
   *
   * @param {MessageContent} message - The message from which filters should be extracted.
   * @returns {Promise<AIMessageChunk>} The extracted filter values in structured format.
   */
  async extractFilterValues(message: MessageContent): Promise<AIMessageChunk> {
    const promptTemplate = PromptTemplate.fromTemplate(
      EXTRACT_FILTER_VALUES_PROMPT
    );
    const chain = promptTemplate.pipe(this.llm);
    return chain.invoke({ message });
  }

  /**
   * Composes a response for the user based on the search query and available pet data.
   *
   * @param {MessageContent} message - The original user query.
   * @param {string} lang - The language in which the response should be composed.
   * @param {Pet[]} pets - A list of matching pets that will be included in the response.
   * @returns {Promise<AIMessageChunk>} A structured response that includes the pet recommendations.
   */
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

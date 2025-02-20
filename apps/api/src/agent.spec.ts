import { extractFilterValues, composeAnswer, translateMessage } from './agent';
import { LlmService } from './llm.service';
import { BaseMessage } from '@langchain/core/messages';
import { Filter, Pet, ResponseType } from './schemas';

// Mocking LlmService
jest.mock('./llm.service');

describe('Agent Functions', () => {
  let llmServiceMock: LlmService;

  beforeEach(() => {
    llmServiceMock = new LlmService();
  });

  const createMockStateForFilterExtraction = (translatedMessage: string) => ({
    messages: [] as BaseMessage[], // Empty message array as default
    lang: 'de',
    translatedMessage,
    isLookingForPet: false, // Added field
    filter: {} as Filter,
    pets: null as Pet[] | null,
    response: null as ResponseType | null,
  });

  const createMockStateForAnswerComposition = (
    message: string,
    lang: string,
    pets: Pet[] | null
  ) => ({
    messages: [{ content: message }] as BaseMessage[],
    lang,
    translatedMessage: message,
    isLookingForPet: true, // Added field
    filter: {} as Filter,
    pets,
    response: null as ResponseType | null,
  });

  const mockPet: Pet = {
    name: 'Bello',
    type: 'dog',
    breed: 'Labrador',
    gender: 'male',
    neutered: true,
    birthYear: 2020,
    image: 'https://example.com/bello.jpg',
    url: 'https://example.com/bello',
    text: 'A friendly and active dog.',
  };

  describe('extractFilterValues', () => {
    it('should extract filter values correctly from LLM response', async () => {
      const mockResponse = { content: JSON.stringify({ type: 'dog' }) };
      llmServiceMock.extractFilterValues = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const state = createMockStateForFilterExtraction(
        'Ich suche einen jungen Hund.'
      );

      const result = await extractFilterValues(state, llmServiceMock);
      expect(result.filter).toEqual({ type: 'dog' });
      expect(llmServiceMock.extractFilterValues).toHaveBeenCalledWith(
        'Ich suche einen jungen Hund.'
      );
    });

    it('should return default filter when LLM response is invalid JSON', async () => {
      const mockResponse = { content: 'invalid-json' };
      llmServiceMock.extractFilterValues = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const state = createMockStateForFilterExtraction('Ich suche eine Katze.');

      const result = await extractFilterValues(state, llmServiceMock);
      expect(result.filter).toEqual({ type: null });
      expect(llmServiceMock.extractFilterValues).toHaveBeenCalledWith(
        'Ich suche eine Katze.'
      );
    });
  });

  describe('translateMessage', () => {
    it('should return the same message if language is already German', async () => {
      const state = {
        messages: [{ content: 'Hallo, wie geht es dir?' }] as BaseMessage[],
        lang: 'de',
        translatedMessage: '',
        isLookingForPet: false, // Added field
        filter: {} as Filter,
        pets: null as Pet[] | null,
        response: null as ResponseType | null,
      };

      const result = await translateMessage(state, llmServiceMock);
      expect(result.translatedMessage).toBe('Hallo, wie geht es dir?');
    });

    it('should translate message to German if language is not German', async () => {
      const mockResponse = { content: 'Hallo, wie geht es dir?' };
      llmServiceMock.translateMessage = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const state = {
        messages: [{ content: 'Hello, how are you?' }] as BaseMessage[],
        lang: 'en',
        translatedMessage: '',
        isLookingForPet: false, // Added field
        filter: {} as Filter,
        pets: null as Pet[] | null,
        response: null as ResponseType | null,
      };

      const result = await translateMessage(state, llmServiceMock);
      expect(result.translatedMessage).toBe('Hallo, wie geht es dir?');
      expect(llmServiceMock.translateMessage).toHaveBeenCalledWith(
        'Hello, how are you?',
        'en'
      );
    });
  });

  describe('composeAnswer', () => {
    it('should compose a valid response from LLM', async () => {
      const mockResponse = {
        content: JSON.stringify({
          generalAnswer: 'Hier sind einige Hunde.',
          individualPetAnswers: [],
        }),
      };
      llmServiceMock.composeAnswer = jest.fn().mockResolvedValue(mockResponse);

      const state = createMockStateForAnswerComposition(
        'Ich suche einen Hund.',
        'de',
        [mockPet]
      );

      const result = await composeAnswer(state, llmServiceMock);
      expect(result.response).toEqual({
        generalAnswer: 'Hier sind einige Hunde.',
        individualPetAnswers: [],
      });
      expect(llmServiceMock.composeAnswer).toHaveBeenCalledWith(
        'Ich suche einen Hund.',
        'de',
        [mockPet]
      );
    });

    it('should return a default response when LLM response is invalid JSON', async () => {
      const mockResponse = { content: 'invalid-json' };
      llmServiceMock.composeAnswer = jest.fn().mockResolvedValue(mockResponse);

      const state = createMockStateForAnswerComposition(
        'Ich suche eine Katze.',
        'de',
        null
      );

      const result = await composeAnswer(state, llmServiceMock);
      expect(result.response).toEqual({
        generalAnswer:
          'There was a problem processing your request. Please try again.',
        individualPetAnswers: [],
      });
      expect(llmServiceMock.composeAnswer).toHaveBeenCalledWith(
        'Ich suche eine Katze.',
        'de',
        null
      );
    });
  });
});

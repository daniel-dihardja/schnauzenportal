import {
  detectLanguage,
  extractFilterValues,
  checkIfLookingForPet,
} from './agent';
import { LlmService } from './llm.service';
import { BaseMessage } from '@langchain/core/messages';

describe('Agent Integration Tests', () => {
  let llmService: LlmService;

  beforeAll(() => {
    llmService = new LlmService(); // Use the real API
  });

  // Function to generate a base state and allow overrides
  const createState = (messages: string[], translatedMessage: string) => ({
    messages: messages.map((content) => ({ content } as BaseMessage)),
    lang: 'de',
    translatedMessage,
    isLookingForPet: false, // Default value for pet search detection
    filter: {},
    pets: null,
    response: null,
  });

  /**
   * Tests for language detection
   */
  describe.each([
    {
      description: 'should detect English when input is in English',
      messages: ['Hello, how are you?', 'Good morning!', 'Can you help me?'],
      expectedLang: 'en',
    },
    {
      description: 'should detect German when input is in German',
      messages: [
        'Hallo, wie geht es dir?',
        'Guten Morgen!',
        'Kannst du mir helfen?',
      ],
      expectedLang: 'de',
    },
    {
      description:
        'should detect unknown language when input is gibberish or mixed',
      messages: [
        'ich ah i 123 xcc yes no vielleicht',
        'qwerty asdf 999',
        'xyz 321 ?!',
      ],
      expectedLang: 'unknown',
    },
  ])('$description', ({ messages, expectedLang }) => {
    it(`should return '${expectedLang}' for given messages`, async () => {
      const state = createState(messages, messages[0]);
      const result = await detectLanguage(state, llmService);
      expect(result.lang).toBe(expectedLang);
    });
  });

  /**
   * Tests for pet filter extraction
   */
  describe.each([
    {
      description: 'should extract filter for "Hund" correctly',
      messages: ['Ich suche einen jungen Hund'],
      translatedMessage: 'Ich suche einen Hund',
      expectedFilter: { type: 'hund' },
    },
    {
      description: 'should extract filter for "Katze" correctly',
      messages: ['Ich suche eine junge Katze'],
      translatedMessage: 'Ich suche eine Katze',
      expectedFilter: { type: 'katze' },
    },
    {
      description: 'should return default filter when no extractable values',
      messages: ['Ich mag Tiere'],
      translatedMessage: 'Ich mag Tiere',
      expectedFilter: { type: null },
    },
  ])('$description', ({ messages, translatedMessage, expectedFilter }) => {
    it(`should extract correct filter values`, async () => {
      const state = createState(messages, translatedMessage);
      const result = await extractFilterValues(state, llmService);
      expect(result.filter).toMatchObject(expectedFilter);
    });
  });

  /**
   * Tests for checking if the user is looking for a pet
   */
  describe.each([
    {
      description: 'should detect pet adoption intent for dog search',
      messages: ['Ich möchte einen Hund adoptieren.'],
      translatedMessage: 'Ich möchte einen Hund adoptieren.',
      expectedIntent: true,
    },
    {
      description: 'should detect pet adoption intent for cat search',
      messages: ['Gibt es Katzen zur Adoption?'],
      translatedMessage: 'Gibt es Katzen zur Adoption?',
      expectedIntent: true,
    },
    {
      description: 'should return false for non-adoption messages',
      messages: ['Wie ist das Wetter heute?'],
      translatedMessage: 'Wie ist das Wetter heute?',
      expectedIntent: false,
    },
    {
      description: 'should return false for general pet-related messages',
      messages: ['Ich mag Katzen.'],
      translatedMessage: 'Ich mag Katzen.',
      expectedIntent: false,
    },
  ])('$description', ({ messages, translatedMessage, expectedIntent }) => {
    it(`should correctly classify pet adoption intent`, async () => {
      const state = createState(messages, translatedMessage);
      const result = await checkIfLookingForPet(state, llmService);
      expect(result.isLookingForPet).toBe(expectedIntent);
    });
  });
});

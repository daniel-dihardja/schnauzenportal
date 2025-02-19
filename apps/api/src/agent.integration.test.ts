import { detectLanguage, extractFilterValues } from './agent';
import { LlmService } from './llm.service';
import { BaseMessage } from '@langchain/core/messages';

describe('Agent Integration Tests', () => {
  let llmService: LlmService;

  beforeAll(() => {
    llmService = new LlmService(); // Use the real API
  });

  // Function to generate a base state and allow overrides
  const createState = (messages: string[], translatedMessage: string) => ({
    messages: messages.map((content) => ({ content })) as BaseMessage[],
    lang: 'de',
    translatedMessage,
    filter: {},
    pets: null,
    response: null,
  });

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
});

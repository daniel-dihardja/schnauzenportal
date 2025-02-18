import { detectLanguage } from './agent';
import { LlmService } from './llm.service';
import { BaseMessage } from '@langchain/core/messages';

describe('Detect Language Function Integration Tests', () => {
  let llmService: LlmService;

  beforeAll(() => {
    llmService = new LlmService(); // Use the real API
  });

  // Function to generate a base state and allow overrides
  const createState = (messages: string[]) => ({
    messages: messages.map((content) => ({ content })) as BaseMessage[],
    lang: '',
    translatedMessage: '',
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
      const state = createState(messages);
      const result = await detectLanguage(state, llmService);
      expect(result.lang).toBe(expectedLang);
    });
  });
});

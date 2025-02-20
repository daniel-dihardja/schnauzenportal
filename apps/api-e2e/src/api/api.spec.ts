import axios from 'axios';

const BASE_URL = 'http://localhost:3333';

jest.setTimeout(30000);

describe('API Tests', () => {
  describe('Should return a list of pets for valid searches', () => {
    test.each([
      { message: 'Ich suche einen Hund zum Adoptieren.' },
      { message: 'Gibt es Katzen, die ein Zuhause brauchen?' },
      { message: 'Welche Hunde sind zur Adoption verfügbar' },
      { message: 'Ich möchte eine Katze adoptieren' },
    ])(
      'should return a valid list of pets for message: %s',
      async ({ message }) => {
        const requestBody = { message };

        const res = await axios.post(`${BASE_URL}/search`, requestBody);

        expect(res.status).toBe(200); // Ensure the API returns 200
        expect(res.data).toBeDefined(); // Ensure response exists

        // Validate `generalAnswer` exists and is a string
        expect(typeof res.data.generalAnswer).toBe('string');
        expect(res.data.generalAnswer.length).toBeGreaterThan(0);

        // Validate `individualPetAnswers` is an array and contains at least one pet
        expect(Array.isArray(res.data.individualPetAnswers)).toBe(true);
        expect(res.data.individualPetAnswers.length).toBeGreaterThan(0);

        // Validate the structure of each pet in `individualPetAnswers`
        res.data.individualPetAnswers.forEach((pet) => {
          expect(typeof pet.petId).toBe('string');
          expect(typeof pet.image).toBe('string');
          expect(typeof pet.url).toBe('string');
          expect(typeof pet.answer).toBe('string');
        });
      }
    );
  });

  describe('Should inform users that only dogs and cats are available', () => {
    test.each([
      { message: 'Ich suche einen Papagei zum Adoptieren.' },
      { message: 'Haben Sie Hamster zur Adoption?' },
      { message: 'Gibt es Schlangen zur Adoption?' },
      { message: 'Kann ich ein Meerschweinchen adoptieren?' },
      { message: 'Ich suche eine Schildkröte als Haustier.' },
    ])(
      'should return a generalAnswer and an empty individualPetAnswers list for message: %s',
      async ({ message }) => {
        const requestBody = { message };

        const res = await axios.post(`${BASE_URL}/search`, requestBody);

        expect(res.status).toBe(200); // Ensure the API always returns 200
        expect(res.data).toBeDefined(); // Ensure response exists

        // Check if `generalAnswer` is defined and non-empty
        expect(typeof res.data.generalAnswer).toBe('string');
        expect(res.data.generalAnswer.length).toBeGreaterThan(0);

        // Ensure `individualPetAnswers` is an empty array
        expect(Array.isArray(res.data.individualPetAnswers)).toBe(true);
        expect(res.data.individualPetAnswers.length).toBe(0);
      }
    );
  });

  describe('Should return a fallback response when the language is unknown', () => {
    test('should return a fallback message when the language cannot be detected', async () => {
      const requestBody = { message: '𓂀𓆑𓈖𓅓𓏏' }; // An example of unknown characters

      const res = await axios.post(`${BASE_URL}/search`, requestBody);

      expect(res.status).toBe(200); // Ensure the API always returns 200
      expect(res.data).toBeDefined(); // Ensure response exists

      // Ensure the response contains the fallback message
      expect(typeof res.data.generalAnswer).toBe('string');
      expect(res.data.generalAnswer).toBe(
        "I'm sorry, but I couldn't detect the language of your message."
      );

      // Ensure `individualPetAnswers` is an empty array
      expect(Array.isArray(res.data.individualPetAnswers)).toBe(true);
      expect(res.data.individualPetAnswers.length).toBe(0);
    });
  });

  describe('Should return a fallback response when the message is not about searching for a pet', () => {
    test.each([
      { message: 'Wie ist das Wetter heute?' },
      { message: 'Kannst du mir ein Rezept für Kuchen geben?' },
      { message: 'Was sind die besten Sehenswürdigkeiten in Berlin?' },
      { message: 'Ich habe einen Hund, er ist sehr süß.' },
      { message: 'Wie programmiere ich eine App?' },
    ])(
      'should return a generalAnswer indicating that only pet searches are supported for message: %s',
      async ({ message }) => {
        const requestBody = { message };

        const res = await axios.post(`${BASE_URL}/search`, requestBody);

        expect(res.status).toBe(200); // Ensure the API always returns 200
        expect(res.data).toBeDefined(); // Ensure response exists

        // Ensure the response contains the informative fallback message
        expect(typeof res.data.generalAnswer).toBe('string');
        expect(res.data.generalAnswer).toBe(
          'I can help you find a pet to adopt! Currently, you can search for dogs or cats.'
        );

        // Ensure `individualPetAnswers` is an empty array
        expect(Array.isArray(res.data.individualPetAnswers)).toBe(true);
        expect(res.data.individualPetAnswers.length).toBe(0);
      }
    );
  });
});

import axios from 'axios';

const BASE_URL = 'http://localhost:3333';

describe('Schnauzenportal API Tests', () => {
  /**
   * Test the root endpoint to check if the API is running.
   */
  describe('GET /', () => {
    it('should return a welcome message', async () => {
      const res = await axios.get(BASE_URL);

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Schnauzenportal' });
    });
  });

  /**
   * Test the /browse endpoint to verify pagination and filtering.
   */
  describe('GET /browse', () => {
    it('should return a list of pets with default pagination (limit=10, skip=0)', async () => {
      const res = await axios.get(`${BASE_URL}/browse?limit=10&skip=0`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeLessThanOrEqual(10); // Ensure max 10 results
    });

    it('should return different pets when using pagination (skip=10)', async () => {
      const res1 = await axios.get(`${BASE_URL}/browse?limit=5&skip=0`);
      const res2 = await axios.get(`${BASE_URL}/browse?limit=5&skip=5`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(Array.isArray(res1.data)).toBe(true);
      expect(Array.isArray(res2.data)).toBe(true);

      // Ensure different sets of results when paginating
      expect(res1.data.length).toBeLessThanOrEqual(5);
      expect(res2.data.length).toBeLessThanOrEqual(5);
      expect(res1.data).not.toEqual(res2.data);
    });

    it('should filter pets by type (e.g., only dogs)', async () => {
      const res = await axios.get(`${BASE_URL}/browse?type=dog&limit=5`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);

      // Ensure all returned pets are of type 'dog'
      res.data.forEach((pet) => {
        expect(pet.type).toBe('dog');
      });
    });

    it('should handle an empty result set when filtering by an unknown type', async () => {
      const res = await axios.get(`${BASE_URL}/browse?type=unknown_animal`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBe(0); // No pets should match
    });

    it('should exclude the "embedding" field from the response', async () => {
      const res = await axios.get(`${BASE_URL}/browse?limit=1`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      if (res.data.length > 0) {
        const pet = res.data[0];
        expect(pet).not.toHaveProperty('embedding'); // Ensure embedding is excluded
      }
    });
  });
});

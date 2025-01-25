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
    it('should return paginated pets with the correct structure', async () => {
      const res = await axios.get(`${BASE_URL}/browse`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('total');
      expect(res.data).toHaveProperty('skip');
      expect(res.data).toHaveProperty('limit');
      expect(res.data).toHaveProperty('results');
      expect(Array.isArray(res.data.results)).toBe(true);
      expect(res.data.results.length).toBeLessThanOrEqual(9);
    });

    it('should return a list of pets with specified pagination (limit=10, skip=0)', async () => {
      const res = await axios.get(`${BASE_URL}/browse?limit=10&skip=0`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('total');
      expect(res.data).toHaveProperty('skip', 0);
      expect(res.data).toHaveProperty('limit', 10);
      expect(Array.isArray(res.data.results)).toBe(true);
      expect(res.data.results.length).toBeLessThanOrEqual(10);
    });

    it('should return different pets when paginating (skip=10)', async () => {
      const res1 = await axios.get(`${BASE_URL}/browse?limit=5&skip=0`);
      const res2 = await axios.get(`${BASE_URL}/browse?limit=5&skip=5`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      expect(Array.isArray(res1.data.results)).toBe(true);
      expect(Array.isArray(res2.data.results)).toBe(true);

      expect(res1.data.results.length).toBeLessThanOrEqual(5);
      expect(res2.data.results.length).toBeLessThanOrEqual(5);

      // Ensure different sets of results when paginating
      expect(res1.data.results).not.toEqual(res2.data.results);
    });

    it('should filter pets by type (e.g., only dogs)', async () => {
      const res = await axios.get(`${BASE_URL}/browse?type=dog&limit=5`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.results)).toBe(true);

      // Ensure all returned pets are of type 'dog'
      res.data.results.forEach((pet: any) => {
        expect(pet.type).toBe('dog');
      });
    });

    it('should handle an empty result set when filtering by an unknown type', async () => {
      const res = await axios.get(`${BASE_URL}/browse?type=unknown_animal`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.results)).toBe(true);
      expect(res.data.results.length).toBe(0); // No pets should match
    });

    it("should exclude the 'embedding' field from the response", async () => {
      const res = await axios.get(`${BASE_URL}/browse?limit=1`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.results)).toBe(true);

      if (res.data.results.length > 0) {
        const pet = res.data.results[0];
        expect(pet).not.toHaveProperty('embedding'); // Ensure embedding is excluded
      }
    });
  });
});

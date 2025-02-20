/**
 * Prompt to detect the language of a user message.
 *
 * The AI should analyze the given message and return the corresponding
 * ISO 639-1 language code (e.g., "en" for English, "de" for German, "es" for Spanish).
 *
 * If the language cannot be determined or the message is gibberish, return "unknown".
 *
 * Expected Output:
 * - Strictly return only a two-letter **lowercase** language code (e.g., "en", "de").
 * - Return "unknown" **only if the text is unreadable or contains no identifiable language**.
 * - No additional text, formatting, or explanations.
 */
export const DETECT_LANGUAGE_PROMPT = `
Your task is to detect the language of the following user message and return only the ISO 639-1 language code.

### Instructions:
- Output must be a **two-letter lowercase** language code (e.g., "en" for English, "de" for German, "fr" for French).
- If the message is a **common word found in multiple languages**, try to infer the best match based on context.
- Return **"unknown" only if the message contains no identifiable language** or is purely random characters.

<message>
{message}
</message>

### Expected Output:
Strictly return:
- A valid **two-letter** ISO 639-1 language code (e.g., "en", "de", "es").
- OR "unknown" **only if necessary**.
- No additional text, symbols, or explanations.
`;

/**
 * Prompt to translate a user message to German.
 *
 * The AI must accurately translate the provided message from the detected source language
 * (represented by {lang}) into German.
 *
 * Expected Output:
 * - The translated text only, without any additional comments or formatting.
 */
export const TRANSLATE_USER_QUERY_PROMPT = `
Your task is to accurately translate the following message from {lang} to German (de).

<message>
{message}
</message>

Provide only the translated text without any additional comments or formatting.
`;

/**
 * Prompt to determine if a user is looking for a pet to adopt.
 *
 * The AI should classify the intent of the message and return a strict boolean response:
 * - "true" → If the user is asking about adopting or searching for a pet.
 * - "false" → If the message is unrelated to pet adoption.
 *
 * Expected Output:
 * - Return only "true" or "false".
 * - No additional text, formatting, or explanations.
 */
export const IS_LOOKING_FOR_PET_PROMPT = `
You are an AI assistant that determines if a message is about looking for a pet to adopt.

Return only "true" if the user is asking about adopting or searching for a pet.
Return only "false" if the message is about something else.

User message:
{message}
`;

/**
 * Prompt to extract filter values from the user's message.
 *
 * The AI should analyze the user's message and extract relevant filter values,
 * such as the type of pet they are looking for.
 *
 * Expected Output:
 * - A JSON object containing extracted filter values.
 * - If a filter is not mentioned, set its value to `null`.
 *
 * Example Output:
 * {
 *   "type": "katze"
 * }
 */
export const EXTRACT_FILTER_VALUES_PROMPT = `
Your task is to identify and extract filter values from the user's message and return them in a JSON format.

### Filters to Extract:
- **type**: Specifies the type of pet.
  - Possible values: "hund" (dog), "katze" (cat).

### User Message:
<message>
{message}
</message>

### Expected Output Format:
Return the extracted filter values as a JSON object. If a filter value is not mentioned, set its value to 'null'.

Example Output:
{{
    "type": "katze"
}}
`;

/**
 * Prompt to generate a response based on the user's query and available pets.
 *
 * The AI should compose a structured response that provides a general answer to the user's query
 * and details about individual pets available for adoption.
 *
 * Expected Output:
 * - A JSON object with:
 *   - `generalAnswer`: A general response addressing the query.
 *   - `individualPetAnswers`: A list of structured answers for each pet.
 *
 * Example Output:
 * {
 *   "generalAnswer": "We have several cats available for adoption.",
 *   "individualPetAnswers": [
 *     {
 *       "petId": "12345",
 *       "image": "https://example.com/cat.jpg",
 *       "url": "https://example.com/cat-profile",
 *       "answer": "This is Luna, a friendly 2-year-old cat looking for a home."
 *     }
 *   ]
 * }
 */
export const COMPOSE_RESPONSE_PROMPT = `
Your task is to compose a comprehensive response to the user's query based on the provided information about available pets.
The response must be written in the language specified by the language code "{lang}" and should be clear, relevant, and helpful.

User Query:
{message}

Available Pets (JSON format):
{pets}

### Response Format:
1. General Answer: Provide a concise, helpful general response addressing the user's query.
2. Individual Pet Answers: For each pet, create a specific answer tailored to the query, following this format:
   {{
     "petId": "<The ID of the pet>",
     "image": "<URL of the pet's image>",
     "url": "<URL of the pet's profile>",
     "answer": "<Your specific answer about the pet>"
   }}

Final Output Format (as a JSON object):
{{
  "generalAnswer": "<Your general answer here>",
  "individualPetAnswers": [
    {{
      "petId": "<The ID of the pet>",
      "image": "<URL of the pet's image>",
      "url": "<URL of the pet's profile>",
      "answer": "<Your specific answer about the pet>"
    }}
    // Repeat for each pet
  ]
}}

Instructions:
- Ensure the general answer addresses the user's query broadly while being informative and concise.
- Tailor each individual pet answer to the specific details of the pet and the context of the user's query.
- Format the entire response strictly as a JSON object.

Compose your response in {lang}.
`;

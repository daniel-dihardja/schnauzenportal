// Prompt to detect the language of a user message
// This prompt requests the language of the given message and returns the ISO 639-1 language code
export const DETECT_LANGUAGE_PROMPT = `
Your task is to detect the language of the following user message and return only the ISO 639-1 language code (e.g., "en" for English, "de" for German, "es" for Spanish).

If the language cannot be determined or the message is gibberish, return "unknown".

<message>
{message}
</message>

Output strictly the two-letter language code or "unknown" with no additional text, quotes, or formatting.
`;

// Prompt to translate a user message from a specified language to German
// Ensures the user's message is accurately translated to German without additional comments or formatting
export const TRANSLATE_USER_QUERY_PROMPT = `
Your task is to accurately translate the following message from {lang} to German (de).

<message>
{message}
</message>

Provide only the translated text without any additional comments or formatting.
`;

// Prompt to extract filter values from the user's message
// Extracts structured data (e.g., pet type) and returns it in JSON format
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

// Prompt to compose a response to the user's query based on available pets
// Generates a comprehensive response in the user's preferred language based on their query and the available pets
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

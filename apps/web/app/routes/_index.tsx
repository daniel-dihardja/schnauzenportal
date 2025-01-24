import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react';
import { ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = formData.get('message');
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error('API_URL is not set in the environment variables');
  }
  const response = await fetch(apiUrl as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }), // Send the query as JSON
  });

  const result = await response.json();
  return Response.json(result);
}

type Pet = {
  id: string;
  image: string;
  answer: string;
  url: string;
};

interface FetcherData {
  generalAnswer?: string;
  individualPetAnswers?: Pet[];
}

const messagePrefixes = [
  {
    label: 'Verspielte Katze gesucht [DE]',
    key: 'Ich suche eine Katze, die besonders verspielt ist und gerne mit Bällen, Federn oder anderen Spielzeugen interagiert. Es wäre schön, wenn sie auch mit anderen Katzen oder sogar mit Hunden spielen kann.',
  },
  {
    label: 'Ruhiger Kuschelkater [DE]',
    key: 'Ich suche eine Katze, die gerne schläft und entspannt ist. Ein richtiger Schmusekater, der sich gerne auf meinem Schoß zusammenrollt und mit mir entspannt. Am liebsten eine ruhige Katze, die nicht allzu aktiv ist.',
  },
  {
    label: 'Hund mit Talent [DE]',
    key: 'Ich suche einen Hund, der schnell lernt und Spaß daran hat, neue Tricks zu lernen. Ich möchte mit ihm Agility oder Tricktraining machen und suche daher einen intelligenten und motivierten Hund.',
  },
  {
    label: 'Katze mit Charakter [DE]',
    key: 'Ich suche eine Katze mit einem besonderen Charakter – vielleicht eine, die gerne „redet“, lustige Eigenheiten hat oder besonders neugierig ist. Ich liebe Katzen mit Persönlichkeit und freue mich auf eine echte kleine Individualistin.',
  },
  {
    label: 'Sportlicher Hund [DE]',
    key: 'Ich suche einen Hund, der gerne draußen unterwegs ist und mich bei Wanderungen, Joggingrunden oder Fahrradtouren begleitet. Am liebsten eine sportliche Rasse, die gerne aktiv ist und sich viel bewegt.',
  },
];

export default function Index() {
  const fetcher = useFetcher<FetcherData>();
  const [message, setMessage] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    setIsButtonEnabled(message.trim() !== '');
  }, [message]);

  const summary = fetcher.data?.generalAnswer || '';
  const pets = fetcher.data?.individualPetAnswers || [];

  return (
    <div className="mx-auto px-2 max-w-[1024px] mt-8">
      <fetcher.Form method="post">
        <div className="grid grid-cols-1 gap-4">
          <Select className="w-full sm:w-80" label="Beispielanfragen">
            {messagePrefixes.map((message) => (
              <SelectItem key={message.key}>{message.label}</SelectItem>
            ))}
          </Select>
          <style>
            {`
                #petDescription::placeholder {
                color: #BCC0C6; /* Custom color between gray-300 and gray-400 */
              }
              `}
          </style>
          <Textarea
            label="Schreiben Sie hier, wonach Sie suchen:"
            id="pet-description"
            name="message"
            placeholder="Beispiel: „Ich suche einen Hund, der möglicherweise Verhaltensprobleme hat oder als schwierig gilt. Ich habe Erfahrung mit solchen Hunden und bin bereit, mit ihm zu arbeiten.“"
            fullWidth={true}
            size="lg"
            minRows={3}
            onChange={(e) => setMessage(e.target.value)}
            variant="flat"
            description="Beschreiben Sie das gesuchte Haustier und Ihre Wohnsituation, z. B. „eine aktive Katze auf dem Land neben einem Wald“."
            classNames={{
              label: 'text-lg font-bold px-2',
              input: 'p-2',
              description: 'text-center text-gray-400 mt-2',
            }}
          />
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            className={`w-full md:w-64 p-6 mt-4 bg-black text-white ${
              !isButtonEnabled
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-gray-800'
            }`}
            style={!isButtonEnabled ? { pointerEvents: 'none' } : {}}
            disabled={!isButtonEnabled}
            isLoading={fetcher.state === 'submitting'}
          >
            <strong>Passende Haustiere finden</strong>
          </Button>
        </div>
      </fetcher.Form>

      {pets ? (
        <div>
          {<p className="mt-8 text-large">{summary}</p>}
          <div className="columns-1 md:columns-2 gap-4 mt-6">
            {pets.map((pet: Pet, index: number) => (
              <Card key={index} className="mb-4">
                <CardBody>
                  <div className="grid grid-cols-1">
                    <div>
                      <img
                        src={pet.image}
                        alt={pet.id}
                        className="w-full rounded-md"
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <h3 className="py-3">
                        <strong>{pet.id}</strong>
                      </h3>
                      <p>{pet.answer}</p>
                      <p className=" pt-2">
                        <a
                          className="text-blue-600 underline"
                          href={pet.url}
                          target="_blank"
                        >
                          {pet.url}
                        </a>
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

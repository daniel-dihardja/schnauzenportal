import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  SharedSelection,
  Textarea,
} from '@nextui-org/react';
import { ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { messagePrefixes } from '../data/messages';

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

export default function Index() {
  const fetcher = useFetcher<FetcherData>();
  const [message, setMessage] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(new Set<string>());

  useEffect(() => {
    setIsButtonEnabled(message.trim() !== '');
  }, [message]);

  const handleSelectChange = (keys: SharedSelection) => {
    // Convert `keys` into an array and extract the first value as a string
    const selectedKey = Array.from(keys).map(String)[0] || '';

    // Find the corresponding message
    const selectedMessage =
      messagePrefixes.find((msg) => msg.key === selectedKey)?.key || '';

    // Ensure selectedKeys state is updated with strings only
    setMessage(selectedMessage);
    setSelectedKeys(new Set<string>([selectedKey]));
  };

  const { generalAnswer: summary = '', individualPetAnswers: pets = [] } =
    fetcher.data || {};

  return (
    <div className="mx-auto px-2 max-w-[1024px] mt-8">
      <fetcher.Form method="post">
        <div className="grid grid-cols-1 gap-4">
          <Select
            data-testid="example-query-select"
            className="w-full sm:w-80"
            label="Example queries"
            selectedKeys={selectedKeys}
            onSelectionChange={handleSelectChange}
          >
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
            label="Write here what you are looking for:"
            id="pet-description"
            data-testid="pet-description-ta"
            name="message"
            placeholder="Example: 'I am looking for a dog that may have behavioral issues or is considered difficult. I have experience with such dogs and am willing to work with them.'"
            fullWidth={true}
            size="lg"
            minRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="flat"
            description="Describe the pet you are looking for, e.g., a calm cuddle cat or a challenging dog in need of training."
            classNames={{
              label: 'text-lg font-bold px-2',
              input: 'p-2',
              description: 'text-center text-black mt-2',
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
            <strong>Find suitable pets</strong>
          </Button>
        </div>
      </fetcher.Form>

      {summary && (
        <div>
          <p className="mt-8 text-large">{summary}</p>
          <div className="columns-1 md:columns-2 gap-4 mt-6 mb-4">
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
      )}
    </div>
  );
}

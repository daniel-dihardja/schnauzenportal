import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Select,
  SelectItem,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Image,
} from '@nextui-org/react';
import { useFilter } from '../context/FilterContext'; // Import filter context
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

const API_URL = 'http://localhost:3333/browse';

interface Pet {
  _id: string;
  name: string;
  type: string;
  image?: string;
  url?: string;
  breed?: string;
  age?: number;
  shelterId?: string;
}

interface ApiResponse {
  total: number;
  skip: number;
  limit: number;
  results: Pet[];
}

interface FilterOption {
  key: string;
  label: string;
}

interface FilterSidebarProps {
  shelters: FilterOption[];
  animals: FilterOption[];
  sizes: FilterOption[];
}

interface FilterDrawerProps extends FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FilterCardProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Fetches pets from the API using `fetch` (preferred method in Remix).
 */
export const loader: LoaderFunction = async () => {
  try {
    const response = await fetch(`${API_URL}?skip=0`);
    if (!response.ok) {
      throw new Response('Failed to fetch pets', { status: response.status });
    }

    const data: ApiResponse = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw new Response('Failed to load pets', { status: 500 });
  }
};

export default function Browse() {
  const { isFilterOpen, closeFilter } = useFilter(); // Get drawer state
  const { total, skip, limit, results: pets } = useLoaderData<ApiResponse>();

  console.log({ total, skip, limit, pets });

  const shelters: FilterOption[] = [
    { key: '0', label: 'Alle' },
    { key: '123', label: '04158 - Tierheim Leipzig' },
  ];
  const animals: FilterOption[] = [
    { key: 'hund', label: 'Hund' },
    { key: 'katze', label: 'Katze' },
  ];
  const sizes: FilterOption[] = [
    { key: 'klein', label: 'Klein' },
    { key: 'mittel', label: 'Mittel' },
    { key: 'gross', label: 'Gross' },
  ];

  return (
    <div>
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar for Filters (Visible on Desktop) */}
        <div className="hidden sm:col-span-3 sm:block">
          <FilterSidebar shelters={shelters} animals={animals} sizes={sizes} />
        </div>

        {/* Drawer for Filters (Visible on Mobile) */}
        <FilterDrawer
          isOpen={isFilterOpen}
          onClose={closeFilter}
          shelters={shelters}
          animals={animals}
          sizes={sizes}
        />

        {/* Main Content Area */}
        <div className="col-span-12 md:col-span-9">
          {/* <h1>Browse all Pets</h1> */}
          <div className="columns-1 md:columns-3 md:gap-4">
            {pets.map((pet) => (
              <div key={pet._id} className="">
                <Card className="h-full mb-4 cursor-pointer" radius="sm">
                  <a href={pet.url} target="_blank" rel="noopener noreferrer">
                    <Image
                      isZoomed
                      radius="sm"
                      alt={`Die Grafik zeigt einen ${
                        pet.breed ? pet.breed : ''
                      } Hund namens ${pet.name}`}
                      className="z-0 w-full h-full object-cover hover:opacity-90 transition-opacity duration-200"
                      src={pet.image}
                      loading="lazy"
                    />
                  </a>
                  <CardBody>
                    <strong className="mt-2">{pet.name}</strong>
                    <a
                      href={pet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {pet.url}
                    </a>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Filter Sidebar (Desktop View) */
function FilterSidebar({ shelters, animals, sizes }: FilterSidebarProps) {
  return (
    <>
      <FilterCard title="Tierheime">
        <Select label="Tierheim" selectionMode="multiple" radius="sm">
          {shelters.map((shelter) => (
            <SelectItem key={shelter.key}>{shelter.label}</SelectItem>
          ))}
        </Select>
      </FilterCard>

      <FilterCard title="Tierart">
        {animals.map((animal) => (
          <div key={animal.key}>
            <Checkbox defaultSelected radius="sm">
              {animal.label}
            </Checkbox>
          </div>
        ))}
      </FilterCard>

      <FilterCard title="Grösse">
        {sizes.map((size) => (
          <div key={size.key}>
            <Checkbox radius="sm">{size.label}</Checkbox>
          </div>
        ))}
      </FilterCard>

      {/* Buttons inside a Card - Hidden on mobile, visible on desktop (sm) */}
      <Card className="mb-2 hidden sm:block" radius="sm">
        <CardBody className="flex flex-col gap-2">
          <Button className="w-full" color="primary">
            Anwenden
          </Button>
          <Button className="w-full" variant="light">
            Zurücksetzen
          </Button>
        </CardBody>
      </Card>
    </>
  );
}

/* Filter Drawer (Mobile View) */
function FilterDrawer({
  isOpen,
  onClose,
  shelters,
  animals,
  sizes,
}: FilterDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onOpenChange={onClose} size="xs" placement="left">
      <DrawerContent>
        {(close) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              Filtereinstellungen
            </DrawerHeader>
            <DrawerBody>
              <FilterSidebar
                shelters={shelters}
                animals={animals}
                sizes={sizes}
              />
            </DrawerBody>
            <DrawerFooter>
              <Card className="w-full" radius="sm">
                <CardBody className="flex flex-col gap-2">
                  <Button className="w-full" color="primary" onPress={close}>
                    Anwenden
                  </Button>
                  <Button className="w-full" variant="light">
                    Zurücksetzen
                  </Button>
                </CardBody>
              </Card>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

/* Reusable Filter Card Component */
function FilterCard({ title, children }: FilterCardProps) {
  return (
    <Card className="mb-2" radius="sm">
      <CardHeader>
        <strong>{title}</strong>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

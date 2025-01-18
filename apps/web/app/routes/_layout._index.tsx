import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Select,
  SelectItem,
} from '@nextui-org/react';

export default function Browse() {
  const shelters = [
    { key: '0', label: 'Alle' },
    { key: '123', label: '04158 - Tierheim Leipzig' },
  ];
  const animals = [
    { key: 'hund', label: 'Hund' },
    { key: 'katze', label: 'Katze' },
  ];
  const sizes = [
    { key: 'klein', label: 'Klein' },
    { key: 'mittel', label: 'Mittel' },
    { key: 'gross', label: 'Gross' },
  ];
  return (
    <div>
      {/* <Card>
        <CardBody className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            <Select label="Tierheim" selectionMode="multiple">
              {shelters.map((shelter) => (
                <SelectItem key={shelter.key}>{shelter.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="col-span-12 md:col-span-2">
            <Select label="Select an animal" selectionMode="multiple">
              {animals.map((animal) => (
                <SelectItem key={animal.key}>{animal.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="col-span-12 md:col-span-2">
            <Select label="Kategorie" selectionMode="multiple">
              {sizes.map((size) => (
                <SelectItem key={size.key}>{size.label}</SelectItem>
              ))}
            </Select>
          </div>
          <div className="col-span-12 md:col-span-2">
            <Button className="w-full h-12 md:h-full">Anwenden</Button>
          </div>
          <div className="col-span-12 md:col-span-2">
            <Button className="w-full h-12 md:h-full" variant="light">
              Zurücksetzen
            </Button>
          </div>
        </CardBody>
      </Card> */}
      <div className="grid grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <Card className="mb-2" radius="sm">
            <CardHeader>
              <strong>Tierheime</strong>
            </CardHeader>
            <CardBody>
              <Select label="Tierheim" selectionMode="multiple" radius="sm">
                {shelters.map((shelter) => (
                  <SelectItem key={shelter.key}>{shelter.label}</SelectItem>
                ))}
              </Select>
            </CardBody>
          </Card>
          <Card className="mb-2" radius="sm">
            <CardHeader>
              <strong>Tierart</strong>
            </CardHeader>
            <CardBody>
              <div>
                <Checkbox defaultSelected radius="sm">
                  Hund
                </Checkbox>
              </div>
              <div>
                <Checkbox defaultSelected radius="sm">
                  Katze
                </Checkbox>
              </div>
            </CardBody>
          </Card>
          <Card className="mb-2" radius="sm">
            <CardHeader>
              <strong>Grösse</strong>
            </CardHeader>
            <CardBody>
              <div>
                <Checkbox radius="sm">Gross</Checkbox>
              </div>
              <div>
                <Checkbox radius="sm">Mittel</Checkbox>
              </div>
              <div>
                <Checkbox radius="sm">Klein</Checkbox>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-2" radius="sm">
            <CardBody>
              <div>
                <Button className="w-full h-12 md:h-12" variant="light">
                  Zurücksetzen
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="md:col-span-9">
          <h1>Browse all Pets</h1>
        </div>
      </div>
    </div>
  );
}

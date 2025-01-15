import { Button, Card, CardBody, Select, SelectItem } from '@nextui-org/react';

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
      <h1>Browse All Pets</h1>
      <Card>
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
            <Button className="w-full md:h-full h-12">Anwenden</Button>
          </div>
          <div className="col-span-12 md:col-span-2">
            <Button className="h-full w-full" variant="light">
              Zurücksetzen
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

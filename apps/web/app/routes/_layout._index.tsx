import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
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
      <div className="grid grid-cols-12 gap-4">
        <div className="hidden sm:col-span-3 sm:block">
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
        <div className="col-span-12 md:col-span-9">
          <h1>Browse all Pets</h1>
        </div>
      </div>
    </div>
  );
}
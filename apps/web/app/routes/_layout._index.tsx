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
} from '@nextui-org/react';
import { useFilter } from '../context/FilterContext'; // Import filter context

export default function Browse() {
  const { isFilterOpen, closeFilter } = useFilter(); // Get drawer state

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
        {/* 📌 Sidebar for Filters (Visible on Desktop) */}
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
              {animals.map((animal) => (
                <div key={animal.key}>
                  <Checkbox defaultSelected radius="sm">
                    {animal.label}
                  </Checkbox>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="mb-2" radius="sm">
            <CardHeader>
              <strong>Grösse</strong>
            </CardHeader>
            <CardBody>
              {sizes.map((size) => (
                <div key={size.key}>
                  <Checkbox radius="sm">{size.label}</Checkbox>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="mb-2" radius="sm">
            <CardBody>
              <Button className="w-full h-12 md:h-12" variant="light">
                Zurücksetzen
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* 📌 Drawer for Filters (Visible on Mobile) */}
        <Drawer
          isOpen={isFilterOpen}
          onOpenChange={closeFilter}
          size="xs"
          placement="left"
        >
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1">
                  Filtereinstellungen
                </DrawerHeader>
                <DrawerBody>
                  {/* 🐾 Same filter UI as sidebar */}
                  <Card className="mb-2" radius="sm">
                    <CardHeader>
                      <strong>Tierheime</strong>
                    </CardHeader>
                    <CardBody>
                      <Select
                        label="Tierheim"
                        selectionMode="multiple"
                        radius="sm"
                      >
                        {shelters.map((shelter) => (
                          <SelectItem key={shelter.key}>
                            {shelter.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </CardBody>
                  </Card>

                  <Card className="mb-2" radius="sm">
                    <CardHeader>
                      <strong>Tierart</strong>
                    </CardHeader>
                    <CardBody>
                      {animals.map((animal) => (
                        <div key={animal.key}>
                          <Checkbox defaultSelected radius="sm">
                            {animal.label}
                          </Checkbox>
                        </div>
                      ))}
                    </CardBody>
                  </Card>

                  <Card className="mb-2" radius="sm">
                    <CardHeader>
                      <strong>Grösse</strong>
                    </CardHeader>
                    <CardBody>
                      {sizes.map((size) => (
                        <div key={size.key}>
                          <Checkbox radius="sm">{size.label}</Checkbox>
                        </div>
                      ))}
                    </CardBody>
                  </Card>
                </DrawerBody>

                <DrawerFooter>
                  {/* <Button color="danger" variant="light" onPress={onClose}>
                    Schließen
                  </Button> */}
                  <Button className="w-full" color="primary" onPress={onClose}>
                    Anwenden
                  </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>

        {/* 📌 Main Content Area */}
        <div className="col-span-12 md:col-span-9">
          <h1>Browse all Pets</h1>
        </div>
      </div>
    </div>
  );
}

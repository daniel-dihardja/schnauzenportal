import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from '@nextui-org/react';
import { Outlet } from '@remix-run/react';

export default function Layout() {
  return (
    <div className="mx-auto px-2 max-w-[1024px] mt-8">
      <Navbar isBordered={true}>
        <NavbarBrand>
          <p className="font-bold text-inherit">Schnauzenportal</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/">Browse</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/search">AI Suche</Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <main>
        <Outlet /> {/* Renders child routes */}
      </main>
    </div>
  );
}

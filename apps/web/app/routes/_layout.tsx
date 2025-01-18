import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from '@nextui-org/react';
import { Outlet, useLocation } from '@remix-run/react';
import { useState } from 'react';
import { FilterProvider, useFilter } from '../context/FilterContext'; // Import Filter Context

function LayoutContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { openFilter } = useFilter(); // Get filter control from context

  return (
    <div className="mx-auto px-2 max-w-[1024px] mt-8">
      <Navbar
        isBordered={true}
        className="mb-4"
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />

        <NavbarBrand>
          <p className="font-bold text-inherit">Schnauzenportal</p>
        </NavbarBrand>

        {/* Desktop Navigation */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive={location.pathname === '/'}>
            <Link
              href="/"
              color={location.pathname === '/' ? 'primary' : 'foreground'}
            >
              Browse
            </Link>
          </NavbarItem>
          <NavbarItem isActive={location.pathname === '/search'}>
            <Link
              href="/search"
              color={location.pathname === '/search' ? 'primary' : 'foreground'}
            >
              AI Suche
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* Filter Button (Only Show on Browse Route) */}
        <NavbarContent justify="end">
          {location.pathname === '/' && (
            <NavbarItem>
              <Button onClick={openFilter} className="sm:hidden">
                Open Filter
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>

        {/* Mobile Navigation */}
        <NavbarMenu className="mt-8">
          <NavbarMenuItem key="browse" isActive={location.pathname === '/'}>
            <Link
              href="/"
              size="lg"
              color={location.pathname === '/' ? 'primary' : 'foreground'}
            >
              Browse
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem
            key="search"
            isActive={location.pathname === '/search'}
          >
            <Link
              href="/search"
              size="lg"
              color={location.pathname === '/search' ? 'primary' : 'foreground'}
            >
              AI Suche
            </Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      <main>
        <Outlet /> {/* Renders child routes */}
      </main>
    </div>
  );
}

// Wrap LayoutContent with FilterProvider
export default function Layout() {
  return (
    <FilterProvider>
      <LayoutContent />
    </FilterProvider>
  );
}

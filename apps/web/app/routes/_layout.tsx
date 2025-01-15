import { Outlet, Link } from '@remix-run/react';

export default function Layout() {
  return (
    <div>
      <header className="border border-black">
        <nav>
          <ul>
            <li>
              <Link to="/">Browse All Pets</Link>
            </li>
            <li>
              <Link to="/search">AI-Based Search</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <div className="mx-auto px-2 max-w-[1024px] mt-8">
          <Outlet /> {/* Renders child routes */}
        </div>
      </main>
    </div>
  );
}

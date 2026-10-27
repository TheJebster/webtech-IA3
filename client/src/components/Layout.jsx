import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import PageLoader from './PageLoader';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollToTop />
      <AppNavbar />
      <main className="flex-grow-1">
        {/* Pages are lazy-loaded, so each route downloads only its own code */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="site-footer">
        <div className="container">RentKit — event equipment rental. MongoDB, Express, React, Node.js.</div>
      </footer>
    </div>
  );
}

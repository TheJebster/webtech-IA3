import { Suspense } from 'react';
import { Container } from 'react-bootstrap';
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
      <footer className="border-top bg-white py-3 mt-4">
        <Container className="d-flex flex-column flex-sm-row justify-content-between small text-muted gap-1">
          <span>© {new Date().getFullYear()} RentKit — Event Equipment Rental</span>
          <span>Built with MongoDB · Express · React · Node.js</span>
        </Container>
      </footer>
    </div>
  );
}

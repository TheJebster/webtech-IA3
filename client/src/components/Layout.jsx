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
        <div className="container d-flex flex-wrap justify-content-between gap-2">
          <span>RentKit — event equipment rental</span>
          <span>MongoDB · Express · React · Node.js</span>
        </div>
      </footer>
    </div>
  );
}

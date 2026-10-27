import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        <Outlet />
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

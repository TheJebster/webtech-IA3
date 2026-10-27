import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  const { user } = useAuth();
  return (
    <Container>
      <h1 className="display-xl mb-3">404</h1>
      <h2>Page not found</h2>
      <p className="text-muted">The page you are looking for doesn’t exist or has moved.</p>
      <Link to={user ? homePathFor(user) : '/'} className="btn btn-primary mt-3">Take me home</Link>
    </Container>
  );
}

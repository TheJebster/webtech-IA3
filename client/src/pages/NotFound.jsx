import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <Container className="py-5 text-center">
      <div className="display-1 fw-bold text-primary">404</div>
      <h1 className="h3 fw-bold">Page not found</h1>
      <p className="text-muted">The page you are looking for doesn’t exist or has moved.</p>
      <Link to={user ? homePathFor(user) : '/'} className="btn btn-primary">Take me home</Link>
    </Container>
  );
}

import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  const { user } = useAuth();
  return (
    <Container className="py-5 text-center">
      <div className="display-heading mb-2">4<span className="sticker" aria-hidden="true">🧭</span>4</div>
      <h1 className="h3">Page not found</h1>
      <p className="text-muted">The page you are looking for doesn’t exist or has moved.</p>
      <Link to={user ? homePathFor(user) : '/'} className="btn btn-primary">Take me home</Link>
    </Container>
  );
}

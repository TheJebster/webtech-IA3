import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import SplitText from '../motion/SplitText';

export default function NotFound() {
  usePageTitle('Page not found');
  const { user } = useAuth();
  return (
    <Container>
      <SplitText as="h1" className="display-xxl mb-3">404</SplitText>
      <h2>Page not found</h2>
      <p className="text-muted">The page you are looking for doesn’t exist or has moved.</p>
      <Link to={user ? homePathFor(user) : '/'} className="btn btn-primary mt-3">Take me home</Link>
    </Container>
  );
}

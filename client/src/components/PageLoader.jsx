import { Spinner } from 'react-bootstrap';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <Spinner animation="border" variant="primary" className="mb-2" />
      <small>{label}</small>
    </div>
  );
}

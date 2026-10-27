import { Spinner } from 'react-bootstrap';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted" role="status" aria-live="polite">
      <Spinner animation="border" className="mb-2" style={{ color: 'var(--brand)' }} />
      <small>{label}</small>
    </div>
  );
}

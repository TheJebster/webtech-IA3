export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="container py-5 text-muted" role="status" aria-live="polite">
      {label}
    </div>
  );
}

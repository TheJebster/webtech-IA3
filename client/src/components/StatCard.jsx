import { Card } from 'react-bootstrap';

// accent: yellow | blue | red | peach | black | gray
export default function StatCard({ icon: Icon, label, value, accent = 'yellow', hint }) {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex align-items-center gap-3">
        <div className={`stat-icon stat-${accent}`}><Icon size={22} /></div>
        <div className="min-w-0">
          <div className="small text-muted text-truncate">{label}</div>
          <div className="h4 fw-bold mb-0">{value}</div>
          {hint && <div className="small text-muted text-truncate">{hint}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}

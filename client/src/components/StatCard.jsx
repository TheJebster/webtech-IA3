import { Card } from 'react-bootstrap';

export default function StatCard({ icon: Icon, label, value, accent = 'primary', hint }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${accent}-subtle text-${accent}`}><Icon size={22} /></div>
        <div className="min-w-0">
          <div className="small text-muted text-truncate">{label}</div>
          <div className="h4 fw-bold mb-0">{value}</div>
          {hint && <div className="small text-muted text-truncate">{hint}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}

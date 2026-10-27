import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CalendarEvent } from 'react-bootstrap-icons';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDayRange } from '../utils/format';

// Welcome strip on the catalog: the customer's rental status at a glance
export default function UserSummary() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/me').then(({ data: res }) => setData(res)).catch(() => {});
  }, []);

  if (!data) return null;
  const pending = data.byStatus.pending || 0;
  const approved = data.byStatus.approved || 0;

  return (
    <Card className="mb-4 user-summary">
      <Card.Body className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
        <div>
          <div className="fw-bold">Hi {user.name.split(' ')[0]} 👋</div>
          <div className="small text-muted">
            {data.total === 0
              ? 'Add equipment to a rental request to get started.'
              : `${pending} pending · ${approved} approved · ${data.total} rental${data.total === 1 ? '' : 's'} in total`}
          </div>
        </div>
        {data.nextRental ? (
          <Link to="/my-rentals" className="next-rental text-decoration-none text-body small d-flex align-items-center gap-2">
            <CalendarEvent className="text-primary" />
            <span>
              Next event: <strong>{data.nextRental.eventName}</strong> · {formatDayRange(data.nextRental.startDate, data.nextRental.endDate)}
            </span>
          </Link>
        ) : (
          <Link to="/my-rentals" className="small">View my rentals →</Link>
        )}
      </Card.Body>
    </Card>
  );
}

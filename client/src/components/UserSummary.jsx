import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarEvent } from 'react-bootstrap-icons';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDayRange } from '../utils/format';

// Signed-in customer's rentals at a glance, shown above the catalog
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
    <div className="user-summary panel d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4" style={{ background: 'var(--brand-soft)', borderColor: 'var(--brand-line)' }}>
      <div>
        <strong>Hi {user.name.split(' ')[0]}!</strong>{' '}
        <span className="text-muted">{pending} pending · {approved} approved · {data.total} rental{data.total === 1 ? '' : 's'} in total.</span>
      </div>
      {data.nextRental ? (
        <Link to="/my-rentals" className="d-inline-flex align-items-center gap-2 small fw-semibold">
          <CalendarEvent /> Next: {data.nextRental.eventName}, {formatDayRange(data.nextRental.startDate, data.nextRental.endDate)}
        </Link>
      ) : (
        <Link to="/my-rentals" className="small fw-semibold">View my rentals →</Link>
      )}
    </div>
  );
}

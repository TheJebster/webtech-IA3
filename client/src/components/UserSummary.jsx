import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatDayRange } from '../utils/format';

// One quiet line on the catalog: the customer's rentals at a glance
export default function UserSummary() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/me').then(({ data: res }) => setData(res)).catch(() => {});
  }, []);

  if (!data) return null;
  const pending = data.byStatus.pending || 0;
  const approved = data.byStatus.approved || 0;

  return (
    <p className="mb-4 user-summary">
      {data.total === 0 ? (
        <span className="text-muted">No rentals yet — add equipment to a request to get started.</span>
      ) : (
        <>
          <span className="text-muted">{pending} pending · {approved} approved · {data.total} in total.</span>{' '}
          {data.nextRental && (
            <Link to="/my-rentals">
              Next: <strong>{data.nextRental.eventName}</strong>, {formatDayRange(data.nextRental.startDate, data.nextRental.endDate)}
            </Link>
          )}
        </>
      )}
    </p>
  );
}

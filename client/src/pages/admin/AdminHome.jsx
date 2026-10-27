import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import api, { parseError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDayRange, timeAgo } from '../../utils/format';
import StatCard from '../../components/StatCard';
import RankList from '../../components/RankList';
import PageHeader from '../../components/PageHeader';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import RentalStatusBadge, { STATUS_META } from '../../components/rentals/RentalStatusBadge';

const CAPABILITIES = [
  { to: '/admin/operations?tab=equipment', title: 'Equipment operations', text: 'View, add, update, hide and delete catalog items.' },
  { to: '/admin/operations?tab=rentals', title: 'Rental requests', text: 'Approve, reject, close or delete customer bookings.' },
  { to: '/admin/users', title: 'User management', text: 'Add users, edit details and roles, deactivate or remove.' },
  { to: '/account/password', title: 'Account security', text: 'Change your admin password at any time.' },
];

export default function AdminHome() {
  usePageTitle('Admin dashboard');
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin').then(({ data: res }) => setData(res)).catch((err) => setError(parseError(err).message));
  }, []);

  if (error) return <Container><EmptyState title="Couldn’t load the dashboard" text={error} /></Container>;
  if (!data) return <PageLoader label="Loading dashboard…" />;

  const pending = data.rentals.pending;

  return (
    <Container>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user.name.split(' ')[0]}. ${pending > 0 ? `${pending} rental request${pending > 1 ? 's are' : ' is'} waiting for review.` : 'All rental requests are up to date.'}`}
      >
        <Link to="/admin/operations?tab=rentals" className="btn btn-primary">Review requests</Link>
        <Link to="/admin/operations?tab=equipment" className="btn btn-outline-secondary">Manage equipment</Link>
      </PageHeader>

      <Row xs={2} lg={4} className="g-3">
        <Col><StatCard label="Equipment items" value={data.equipment.total} hint={`${data.equipment.units} units · ${data.equipment.hidden} hidden`} /></Col>
        <Col><StatCard label="Registered users" value={data.users.total} hint={`${data.users.customers} customers · ${data.users.admins} admin${data.users.admins === 1 ? '' : 's'}`} /></Col>
        <Col><StatCard label="Pending requests" value={pending} hint={`${data.rentals.total} rentals in total`} /></Col>
        <Col><StatCard label="Rental revenue" value={formatCurrency(data.revenue.total)} hint={`${data.revenue.rentals} approved or returned`} /></Col>
      </Row>

      <div className="block-gap">
        <div className="panel-title">What you can do</div>
        <Row xs={1} sm={2} lg={4} className="g-3">
          {CAPABILITIES.map(({ to, title, text }) => (
            <Col key={title}>
              <Link to={to} className="catalog-item">
                <span className="catalog-name">{title}</span>
                <span className="catalog-desc mb-0">{text}</span>
              </Link>
            </Col>
          ))}
        </Row>
      </div>

      <Row className="g-3 block-gap">
        <Col lg={7}>
          <div className="panel">
          <div className="panel-title">Upcoming rentals</div>
          {data.upcoming.length === 0 ? (
            <p className="text-muted">Nothing scheduled.</p>
          ) : (
            <ul className="plain-list" style={{ gap: 16 }}>
              {data.upcoming.map((r) => (
                <li key={r._id} className="d-flex justify-content-between gap-4">
                  <div className="min-w-0">
                    <div className="fw-semibold">{r.eventName}</div>
                    <div className="small text-muted">{formatDayRange(r.startDate, r.endDate)} · {r.customerName} · {r.venue}</div>
                  </div>
                  <div className="text-end text-nowrap">
                    <RentalStatusBadge status={r.status} />
                    <div className="small mt-1">{formatCurrency(r.totalCost)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/operations?tab=rentals" className="link-arrow d-inline-block mt-4">All rentals</Link>
          </div>

          <Row xs={1} md={2} className="g-3 mt-0">
            <Col>
              <div className="panel h-100">
              <div className="panel-title">Top equipment by revenue</div>
              {data.topEquipment.length === 0 ? (
                <p className="text-muted">No completed rentals yet.</p>
              ) : (
                <RankList
                  label="Top equipment by revenue"
                  format={formatCurrency}
                  rows={data.topEquipment.map((t) => ({ key: String(t.equipment), label: t.name, value: t.revenue, hint: `${t.units} units rented` }))}
                />
              )}
              </div>
            </Col>
            <Col>
              <div className="panel h-100">
              <div className="panel-title">Rentals by status</div>
              <RankList
                label="Rentals by status"
                rows={Object.keys(STATUS_META).map((s) => ({ key: s, label: STATUS_META[s].label, value: data.rentals.byStatus[s] || 0 }))}
              />
              </div>
            </Col>
          </Row>
        </Col>

        <Col lg={5}>
          <div className="panel">
          <div className="panel-title">Recent activity</div>
          {data.recentActivity.length === 0 ? (
            <p className="text-muted">No activity yet.</p>
          ) : (
            <ul className="plain-list small" style={{ gap: 14 }}>
              {data.recentActivity.map((a) => (
                <li key={a._id}>
                  <strong>{a.actorName}</strong> {a.message}
                  <div className="small text-muted">{timeAgo(a.createdAt)}</div>
                </li>
              ))}
            </ul>
          )}

          </div>

          <div className="panel mt-3">
          <div className="panel-title">Inventory by category</div>
          <RankList
            label="Units owned by category"
            format={(v) => `${v} units`}
            rows={data.byCategory.map((c) => ({ key: c.category, label: c.category, hint: `${c.items} items`, value: c.units }))}
          />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

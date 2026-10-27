import { useEffect, useState } from 'react';
import { Card, Col, Container, ListGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  BoxSeam, CalendarEvent, CashStack, ClipboardCheck, ClockHistory, GraphUp, HourglassSplit, PeopleFill, ShieldLock,
  ArrowRight, Tools,
} from 'react-bootstrap-icons';
import api, { parseError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDayRange, timeAgo } from '../../utils/format';
import StatCard from '../../components/StatCard';
import BarList from '../../components/BarList';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import RentalStatusBadge, { STATUS_META } from '../../components/rentals/RentalStatusBadge';
import usePageTitle from '../../hooks/usePageTitle';

const CAPABILITIES = [
  { to: '/admin/operations?tab=equipment', icon: Tools, title: 'Equipment operations', text: 'View, add, update, hide and delete catalog items.' },
  { to: '/admin/operations?tab=rentals', icon: ClipboardCheck, title: 'Rental requests', text: 'Approve, reject, close or delete customer bookings.' },
  { to: '/admin/users', icon: PeopleFill, title: 'User management', text: 'Add users, edit details and roles, deactivate or remove.' },
  { to: '/account/password', icon: ShieldLock, title: 'Account security', text: 'Change your admin password at any time.' },
];

const ACTIVITY_ICON = { user: PeopleFill, equipment: BoxSeam, rental: ClipboardCheck };

export default function AdminHome() {
  usePageTitle('Admin dashboard');
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/admin').then(({ data: res }) => setData(res)).catch((err) => setError(parseError(err).message));
  }, []);

  if (error) return <Container className="py-4"><EmptyState title="Couldn’t load the dashboard" text={error} /></Container>;
  if (!data) return <PageLoader label="Loading dashboard…" />;

  const statusRows = ['pending', 'approved', 'returned', 'rejected', 'cancelled'];

  return (
    <Container className="py-4">
      <div className="dash-hero rounded-4 p-4 p-md-5 mb-4 text-white">
        <div className="small text-uppercase opacity-75 fw-semibold mb-1">Admin dashboard</div>
        <h1 className="h2 fw-bold mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="mb-3 opacity-75">
          {data.rentals.pending > 0
            ? `${data.rentals.pending} rental request${data.rentals.pending > 1 ? 's are' : ' is'} waiting for your review.`
            : 'All rental requests are up to date.'}
        </p>
        <Link to="/admin/operations?tab=rentals" className="btn btn-light fw-semibold">
          Review requests <ArrowRight className="ms-1" />
        </Link>
      </div>

      <Row xs={1} sm={2} xl={4} className="g-3 mb-4">
        <Col><StatCard icon={BoxSeam} label="Equipment items" value={data.equipment.total} hint={`${data.equipment.units} units · ${data.equipment.hidden} hidden`} /></Col>
        <Col><StatCard icon={PeopleFill} label="Registered users" value={data.users.total} hint={`${data.users.customers} customers · ${data.users.admins} admin${data.users.admins === 1 ? '' : 's'}`} accent="info" /></Col>
        <Col><StatCard icon={HourglassSplit} label="Pending requests" value={data.rentals.pending} hint={`${data.rentals.total} rentals in total`} accent="warning" /></Col>
        <Col><StatCard icon={CashStack} label="Rental revenue" value={formatCurrency(data.revenue.total)} hint={`from ${data.revenue.rentals} approved / returned`} accent="success" /></Col>
      </Row>

      <h2 className="h5 fw-bold mb-3">What you can do</h2>
      <Row xs={1} sm={2} lg={4} className="g-3 mb-4">
        {CAPABILITIES.map(({ to, icon: Icon, title, text }) => (
          <Col key={title}>
            <Card as={Link} to={to} className="h-100 border-0 shadow-sm text-decoration-none text-body capability-card">
              <Card.Body>
                <div className="icon-circle mb-2"><Icon size={20} /></div>
                <div className="fw-semibold mb-1">{title}</div>
                <div className="small text-muted">{text}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <span className="fw-semibold d-flex align-items-center gap-2"><CalendarEvent />Upcoming rentals</span>
              <Link to="/admin/operations?tab=rentals" className="small">View all</Link>
            </Card.Header>
            {data.upcoming.length === 0 ? (
              <EmptyState title="Nothing scheduled" text="Approved and pending rentals appear here." />
            ) : (
              <ListGroup variant="flush">
                {data.upcoming.map((r) => (
                  <ListGroup.Item key={r._id} className="d-flex justify-content-between align-items-center gap-2 py-3">
                    <div className="min-w-0">
                      <div className="fw-semibold text-truncate">{r.eventName}</div>
                      <div className="small text-muted text-truncate">{formatDayRange(r.startDate, r.endDate)} · {r.customerName} · {r.venue}</div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <RentalStatusBadge status={r.status} />
                      <div className="small fw-semibold mt-1">{formatCurrency(r.totalCost)}</div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>

          <Row className="g-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white py-3 fw-semibold d-flex align-items-center gap-2"><GraphUp />Top equipment by revenue</Card.Header>
                <Card.Body>
                  {data.topEquipment.length === 0 ? (
                    <p className="text-muted small mb-0">No completed rentals yet.</p>
                  ) : (
                    <BarList
                      label="Top equipment by revenue"
                      format={formatCurrency}
                      rows={data.topEquipment.map((t) => ({ key: String(t.equipment), label: t.name, value: t.revenue, hint: `${t.units} units rented` }))}
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white py-3 fw-semibold d-flex align-items-center gap-2"><ClipboardCheck />Rentals by status</Card.Header>
                <ListGroup variant="flush">
                  {statusRows.map((s) => (
                    <ListGroup.Item key={s} className="d-flex justify-content-between align-items-center">
                      <RentalStatusBadge status={s} />
                      <Link to="/admin/operations?tab=rentals" className="fw-semibold text-body text-decoration-none" aria-label={`${data.rentals.byStatus[s] || 0} ${STATUS_META[s].label}`}>
                        {data.rentals.byStatus[s] || 0}
                      </Link>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white py-3 fw-semibold d-flex align-items-center gap-2"><ClockHistory />Recent activity</Card.Header>
            {data.recentActivity.length === 0 ? (
              <EmptyState title="No activity yet" />
            ) : (
              <ListGroup variant="flush">
                {data.recentActivity.map((a) => {
                  const Icon = ACTIVITY_ICON[a.entity] || ClockHistory;
                  return (
                    <ListGroup.Item key={a._id} className="d-flex gap-3 py-3">
                      <div className="activity-icon flex-shrink-0"><Icon size={14} /></div>
                      <div className="min-w-0">
                        <div className="small"><strong>{a.actorName}</strong> {a.message}</div>
                        <div className="small text-muted">{timeAgo(a.createdAt)}</div>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 fw-semibold d-flex align-items-center gap-2"><BoxSeam />Inventory by category</Card.Header>
            <Card.Body>
              <BarList
                label="Units owned by category"
                format={(v) => `${v} units`}
                rows={data.byCategory.map((c) => ({ key: c.category, label: `${c.category} (${c.items} items)`, value: c.units }))}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

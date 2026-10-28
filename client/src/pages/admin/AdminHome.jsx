import { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  IconArrowRight, IconCalendarEvent, IconCash, IconCheck, IconClipboardCheck, IconHourglassHigh, IconPackage, IconPlus,
  IconShieldLock, IconTool, IconTruckReturn, IconUserPlus, IconUsers, IconX,
} from '@tabler/icons-react';
import usePageTitle from '../../hooks/usePageTitle';
import api, { parseError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDayRange, timeAgo } from '../../utils/format';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import ItemVisual from '../../components/store/ItemVisual';
import RentalStatusBadge, { STATUS_META } from '../../components/rentals/RentalStatusBadge';
import { KpiCard, RevenueChart, StatusDonut, UtilizationRing } from '../../components/dashboard/DashboardWidgets';
import EquipmentImage from '../../components/EquipmentImage';

const QUICK_ACTIONS = [
  { to: '/admin/operations?tab=rentals', icon: IconClipboardCheck, title: 'Review requests', text: 'Approve, reject or close bookings.' },
  { to: '/admin/operations?tab=equipment', icon: IconTool, title: 'Equipment operations', text: 'Add, edit, hide or delete items.' },
  { to: '/admin/users', icon: IconUsers, title: 'User management', text: 'Add users, change roles, deactivate.' },
  { to: '/account/password', icon: IconShieldLock, title: 'Account security', text: 'Change your admin password.' },
];

// Icon + tone for each activity type in the feed
function activityStyle(action) {
  if (action === 'user.signup' || action === 'user.create') return { icon: IconUserPlus, tone: 'violet' };
  if (action.startsWith('equipment')) return { icon: IconPackage, tone: 'blue' };
  if (action === 'rental.approved') return { icon: IconCheck, tone: 'green' };
  if (action === 'rental.rejected' || action === 'rental.cancel' || action === 'rental.cancelled') return { icon: IconX, tone: 'red' };
  if (action === 'rental.returned') return { icon: IconTruckReturn, tone: 'blue' };
  if (action.startsWith('rental')) return { icon: IconCalendarEvent, tone: 'orange' };
  return { icon: IconUsers, tone: 'gray' };
}

const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

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
  const statusLabels = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label]));
  const topMax = Math.max(1, ...data.topEquipment.map((t) => t.revenue));

  return (
    <Container>
      <div className="dash-header">
        <div>
          <div className="small text-muted mb-1">{today}</div>
          <h1 className="mb-1">Good to see you, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-muted mb-0">
            {pending > 0
              ? <>You have <strong>{pending} rental request{pending > 1 ? 's' : ''}</strong> waiting for review.</>
              : 'All rental requests are up to date.'}
          </p>
        </div>
        <div className="action-row">
          <Link to="/admin/operations?tab=equipment" className="btn btn-outline-secondary"><IconPlus size={18} className="me-1" />Add equipment</Link>
          <Link to="/admin/operations?tab=rentals" className="btn btn-primary">Review requests <IconArrowRight size={18} className="ms-1" /></Link>
        </div>
      </div>

      <Row xs={2} xl={4} className="g-2 g-sm-3 mb-3">
        <Col>
          <KpiCard icon={IconCash} tone="orange" label="Revenue this month" value={formatCurrency(data.revenue.thisMonth)} hint={`${formatCurrency(data.revenue.total)} all time`} change={data.revenue.change} />
        </Col>
        <Col><KpiCard icon={IconHourglassHigh} tone="amber" label="Pending requests" value={pending} hint={`${data.rentals.total} rentals in total`} /></Col>
        <Col><KpiCard icon={IconPackage} tone="blue" label="Equipment items" value={data.equipment.total} hint={`${data.equipment.units} units · ${data.equipment.hidden} hidden`} /></Col>
        <Col><KpiCard icon={IconUsers} tone="violet" label="Registered users" value={data.users.total} hint={`${data.users.customers} customers · ${data.users.admins} admin${data.users.admins === 1 ? '' : 's'}`} /></Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={8}>
          <div className="panel h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div className="panel-title mb-0">Revenue</div>
                <div className="small text-muted">Approved and returned rentals, last 6 months</div>
              </div>
              <span className="price">{formatCurrency(data.monthly.reduce((s, m) => s + m.revenue, 0))}</span>
            </div>
            <RevenueChart data={data.monthly} />
          </div>
        </Col>
        <Col lg={4}>
          <div className="panel h-100">
            <div className="panel-title">Rentals by status</div>
            <StatusDonut byStatus={data.rentals.byStatus} labels={statusLabels} />
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={7}>
          <div className="panel h-100">
            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <div className="panel-title mb-0">Upcoming rentals</div>
              <Link to="/admin/operations?tab=rentals" className="link-arrow small">All rentals</Link>
            </div>
            {data.upcoming.length === 0 ? (
              <p className="text-muted mb-0">Nothing scheduled.</p>
            ) : (
              <ul className="timeline">
                {data.upcoming.map((r) => {
                  const start = new Date(r.startDate);
                  return (
                    <li key={r._id}>
                      <div className="date-block">
                        <strong>{start.getUTCDate()}</strong>
                        <span>{start.toLocaleString('en', { month: 'short', timeZone: 'UTC' })}</span>
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between gap-2">
                          <span className="fw-semibold text-truncate" style={{ color: 'var(--ink)' }}>{r.eventName}</span>
                          <RentalStatusBadge status={r.status} />
                        </div>
                        <div className="small text-muted text-truncate">{formatDayRange(r.startDate, r.endDate)} · {r.customerName} · {r.venue}</div>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                          <div className="mini-thumbs" aria-hidden="true">
                            {r.items.slice(0, 5).map((i) => <span key={i.equipment}><EquipmentImage item={i} size="thumb" /></span>)}
                            {r.items.length > 5 && <em>+{r.items.length - 5}</em>}
                          </div>
                          <span className="fw-bold" style={{ color: 'var(--ink)' }}>{formatCurrency(r.totalCost)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Col>
        <Col lg={5}>
          <div className="panel h-100">
            <div className="panel-title">Recent activity</div>
            {data.recentActivity.length === 0 ? (
              <p className="text-muted mb-0">No activity yet.</p>
            ) : (
              <ul className="feed">
                {data.recentActivity.map((a) => {
                  const { icon: Icon, tone } = activityStyle(a.action);
                  return (
                    <li key={a._id}>
                      <span className={`feed-icon tone-${tone}`}><Icon size={16} stroke={2} /></span>
                      <div className="min-w-0">
                        <div className="small"><strong>{a.actorName}</strong> {a.message}</div>
                        <div className="small text-muted">{timeAgo(a.createdAt)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col lg={7}>
          <div className="panel h-100">
            <div className="panel-title">Top equipment by revenue</div>
            {data.topEquipment.length === 0 ? (
              <p className="text-muted mb-0">No completed rentals yet.</p>
            ) : (
              <ul className="top-list">
                {data.topEquipment.map((t, i) => (
                  <li key={String(t.equipment)}>
                    <span className="rank">{i + 1}</span>
                    <span className="top-thumb"><EquipmentImage item={t} size="thumb" /></span>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between gap-2">
                        <span className="fw-semibold text-truncate" style={{ color: 'var(--ink)' }}>{t.name}</span>
                        <span className="fw-bold text-nowrap" style={{ color: 'var(--ink)' }}>{formatCurrency(t.revenue)}</span>
                      </div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${(t.revenue / topMax) * 100}%` }} /></div>
                      <div className="small text-muted">{t.units} units rented</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>
        <Col lg={5}>
          <div className="panel mb-3">
            <div className="panel-title">Inventory in use</div>
            <UtilizationRing value={data.utilization.unitsOut} total={data.utilization.totalUnits} />
          </div>
          <div className="panel">
            <div className="panel-title">Inventory by category</div>
            <div className="cat-chips">
              {data.byCategory.map((c) => (
                <span key={c.category} className="cat-chip">
                  <span className="top-thumb sm"><ItemVisual item={{ category: c.category, name: c.category }} size="thumb" /></span>
                  <span className="min-w-0">
                    <span className="d-block fw-semibold text-truncate" style={{ color: 'var(--ink)' }}>{c.category}</span>
                    <span className="small text-muted">{c.units} units · {c.items} items</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <div className="panel-title mt-4">Quick actions</div>
      <Row xs={1} sm={2} lg={4} className="g-3">
        {QUICK_ACTIONS.map(({ to, icon: Icon, title, text }) => (
          <Col key={title}>
            <Link to={to} className="catalog-item quick-action">
              <span className="kpi-icon tone-orange mb-2"><Icon size={20} stroke={1.8} /></span>
              <span className="catalog-name">{title}</span>
              <span className="catalog-desc">{text}</span>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

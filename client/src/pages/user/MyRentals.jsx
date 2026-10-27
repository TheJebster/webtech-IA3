import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Nav, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CalendarEvent, ClipboardCheck, GeoAlt } from 'react-bootstrap-icons';
import api, { parseError } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, formatDayRange } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge';
import RentalDetailsModal from '../../components/rentals/RentalDetailsModal';
import usePageTitle from '../../hooks/usePageTitle';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'closed', label: 'Past & closed', statuses: ['returned', 'rejected', 'cancelled'] },
];

export default function MyRentals() {
  usePageTitle('My rentals');
  const notify = useToast();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/rentals/mine');
      setRentals(data.items);
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const confirmCancel = async () => {
    setBusy(true);
    try {
      await api.patch(`/rentals/${cancelling._id}/cancel`);
      notify(`Request ${cancelling.code} was cancelled.`, 'secondary');
      setViewing(null);
      load();
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setCancelling(null);
      setBusy(false);
    }
  };

  const current = TABS.find((t) => t.key === tab);
  const visible = rentals.filter((r) =>
    tab === 'all' ? true : current.statuses ? current.statuses.includes(r.status) : r.status === tab
  );
  const countFor = (t) => (t.key === 'all' ? rentals.length : rentals.filter((r) => (t.statuses ? t.statuses.includes(r.status) : r.status === t.key)).length);

  return (
    <Container className="py-4">
      <PageHeader title="My rentals" sticker="📋" subtitle="Track the status of your rental requests.">
        <Link to="/catalog" className="btn btn-primary">New request</Link>
      </PageHeader>

      <Nav variant="pills" activeKey={tab} onSelect={setTab} className="mb-3 gap-2 flex-nowrap overflow-auto pb-1">
        {TABS.map((t) => (
          <Nav.Item key={t.key}>
            <Nav.Link eventKey={t.key} className="text-nowrap">
              {t.label} <Badge bg="light" text="dark" className="ms-1">{countFor(t)}</Badge>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {loading ? (
        <PageLoader />
      ) : visible.length === 0 ? (
        <Card className="">
          <EmptyState icon={ClipboardCheck} title="No rentals here yet" text="When you request equipment for an event, it shows up here.">
            <Link to="/catalog" className="btn btn-outline-primary">Browse equipment</Link>
          </EmptyState>
        </Card>
      ) : (
        <Row xs={1} md={2} className="g-3">
          {visible.map((r) => (
            <Col key={r._id}>
              <Card className="h-100 rental-card">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="small text-muted">{r.code} · requested {formatDate(r.createdAt)}</div>
                      <h2 className="h5 mb-0 text-truncate">{r.eventName}</h2>
                    </div>
                    <RentalStatusBadge status={r.status} />
                  </div>
                  <div className="small text-muted d-flex flex-column gap-1 mb-2">
                    <span><CalendarEvent className="me-1" />{formatDayRange(r.startDate, r.endDate)} · {r.days} day{r.days > 1 ? 's' : ''}</span>
                    <span><GeoAlt className="me-1" />{r.venue}</span>
                  </div>
                  <div className="small mb-3">
                    {r.items.slice(0, 3).map((i) => `${i.quantity} × ${i.name}`).join(', ')}
                    {r.items.length > 3 && ` +${r.items.length - 3} more`}
                  </div>
                  {r.adminNote && <div className="small bg-light rounded p-2 mb-3"><strong>Note:</strong> {r.adminNote}</div>}
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="h5 fw-bold mb-0">{formatCurrency(r.totalCost)}</span>
                    <div className="d-flex gap-2">
                      {r.status === 'pending' && (
                        <Button size="sm" variant="outline-danger" onClick={() => setCancelling(r)}>Cancel</Button>
                      )}
                      <Button size="sm" variant="outline-primary" onClick={() => setViewing(r)}>Details</Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <RentalDetailsModal
        rental={viewing}
        show={Boolean(viewing)}
        onClose={() => setViewing(null)}
        footer={viewing?.status === 'pending' && (
          <Button variant="outline-danger" className="me-auto" onClick={() => setCancelling(viewing)}>Cancel request</Button>
        )}
      />
      <ConfirmModal
        show={Boolean(cancelling)}
        title="Cancel this request?"
        body={<>Your request for <strong>{cancelling?.eventName}</strong> ({cancelling?.code}) will be cancelled and the equipment released.</>}
        confirmLabel="Cancel request"
        busy={busy}
        onConfirm={confirmCancel}
        onCancel={() => setCancelling(null)}
      />
    </Container>
  );
}

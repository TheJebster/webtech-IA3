import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Col, Form, InputGroup, Modal, Nav, Row, Spinner, Table } from 'react-bootstrap';
import { BoxArrowInDown, CheckLg, Eye, Search, Trash3, XLg, SlashCircle } from 'react-bootstrap-icons';
import api, { parseError } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency, formatDayRange } from '../../utils/format';
import ConfirmModal from '../ConfirmModal';
import Paginator from '../Paginator';
import PageLoader from '../PageLoader';
import EmptyState from '../EmptyState';
import RentalStatusBadge, { STATUS_META } from '../rentals/RentalStatusBadge';
import RentalDetailsModal from '../rentals/RentalDetailsModal';

const PAGE_SIZE = 10;
const STATUS_TABS = ['', 'pending', 'approved', 'returned', 'rejected', 'cancelled'];

const ACTIONS = {
  approved: { label: 'Approve', variant: 'success', icon: CheckLg, verb: 'approved' },
  rejected: { label: 'Reject', variant: 'danger', icon: XLg, verb: 'rejected' },
  returned: { label: 'Mark returned', variant: 'info', icon: BoxArrowInDown, verb: 'marked as returned' },
  cancelled: { label: 'Cancel booking', variant: 'secondary', icon: SlashCircle, verb: 'cancelled' },
};
const NEXT = { pending: ['approved', 'rejected'], approved: ['returned', 'cancelled'] };

export default function RentalsManager() {
  const notify = useToast();
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const q = useDebounce(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1, counts: {} });
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [deciding, setDeciding] = useState(null); // { rental, status }
  const [note, setNote] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/rentals', { params: { status: status || undefined, q: q || undefined, page, limit: PAGE_SIZE } });
      setData(res);
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [status, q, page, notify]);

  useEffect(() => { load(); }, [load]);

  const openDecision = (rental, next) => {
    setDeciding({ rental, status: next });
    setNote(rental.adminNote || '');
  };

  const submitDecision = async () => {
    setBusy(true);
    try {
      const { data: res } = await api.patch(`/rentals/${deciding.rental._id}/status`, { status: deciding.status, adminNote: note.trim() });
      notify(`Rental ${res.rental.code} ${ACTIONS[deciding.status].verb}.`, ACTIONS[deciding.status].variant === 'danger' ? 'secondary' : 'success');
      setDeciding(null);
      setViewing(null);
      load();
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const { data: res } = await api.delete(`/rentals/${deleting._id}`);
      notify(res.message);
      setViewing(null);
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setDeleting(null);
      setBusy(false);
    }
  };

  const total = Object.values(data.counts || {}).reduce((a, b) => a + b, 0);
  const actionButtons = (r, size = 'sm') =>
    (NEXT[r.status] || []).map((next) => {
      const { label, variant, icon: Icon } = ACTIONS[next];
      return (
        <Button key={next} size={size} variant={`outline-${variant}`} title={label} aria-label={`${label} ${r.code}`} onClick={() => openDecision(r, next)}>
          <Icon />{size !== 'sm' && <span className="ms-1">{label}</span>}
        </Button>
      );
    });

  return (
    <Card className="">
      <Card.Body className="p-3 p-md-4">
        <Nav variant="pills" activeKey={status} onSelect={(k) => { setStatus(k); setPage(1); }} className="gap-1 mb-3 flex-nowrap overflow-auto pb-1 small">
          {STATUS_TABS.map((s) => (
            <Nav.Item key={s || 'all'}>
              <Nav.Link eventKey={s} className="text-nowrap py-1 px-3">
                {s ? STATUS_META[s].label : 'All'}{' '}
                <Badge bg="light" text="dark">{s ? data.counts?.[s] || 0 : total}</Badge>
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <Row className="g-2 mb-3">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text><Search /></InputGroup.Text>
              <Form.Control
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search event, venue, customer or item…"
                aria-label="Search rentals"
              />
            </InputGroup>
          </Col>
        </Row>

        {loading ? (
          <PageLoader />
        ) : data.items.length === 0 ? (
          <EmptyState title={`No ${status ? STATUS_META[status].label.toLowerCase() : ''} rentals`} text="Rental requests from customers will appear here." />
        ) : (
          <Table responsive hover className="align-middle mb-3 ops-table">
            <thead className="table-light">
              <tr>
                <th>Rental</th>
                <th className="d-none d-md-table-cell">Customer</th>
                <th className="d-none d-lg-table-cell">Dates</th>
                <th className="text-end d-none d-sm-table-cell">Total</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="fw-semibold">{r.eventName}</div>
                    <div className="small text-muted">{r.code} · {r.items.length} item{r.items.length > 1 ? 's' : ''}</div>
                  </td>
                  <td className="d-none d-md-table-cell">
                    <div>{r.customerName}</div>
                    <div className="small text-muted">{r.customerEmail}</div>
                  </td>
                  <td className="small text-nowrap d-none d-lg-table-cell">{formatDayRange(r.startDate, r.endDate)}<div className="text-muted">{r.days} day{r.days > 1 ? 's' : ''}</div></td>
                  <td className="text-end text-nowrap fw-semibold d-none d-sm-table-cell">{formatCurrency(r.totalCost)}</td>
                  <td><RentalStatusBadge status={r.status} /></td>
                  <td className="text-end">
                    <ButtonGroup size="sm">
                      <Button variant="outline-secondary" title="View details" aria-label={`View ${r.code}`} onClick={() => setViewing(r)}><Eye /></Button>
                      {actionButtons(r)}
                      <Button variant="outline-danger" title="Delete" aria-label={`Delete ${r.code}`} onClick={() => setDeleting(r)}><Trash3 /></Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Paginator page={page} pages={data.pages} onChange={setPage} />
      </Card.Body>

      <RentalDetailsModal
        rental={viewing}
        show={Boolean(viewing) && !deciding && !deleting}
        showCustomer
        onClose={() => setViewing(null)}
        footer={viewing && <div className="me-auto d-flex flex-wrap gap-2">{actionButtons(viewing, 'md')}</div>}
      />

      <Modal show={Boolean(deciding)} onHide={busy ? undefined : () => setDeciding(null)} centered>
        <Modal.Header closeButton={!busy}>
          <Modal.Title className="h5">{deciding && `${ACTIONS[deciding.status].label} ${deciding.rental.code}?`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deciding && (
            <>
              <p className="mb-3">
                <strong>{deciding.rental.eventName}</strong> for {deciding.rental.customerName} ·{' '}
                {formatDayRange(deciding.rental.startDate, deciding.rental.endDate)} · {formatCurrency(deciding.rental.totalCost)}
              </p>
              <Form.Group controlId="adminNote">
                <Form.Label>Note to customer <span className="text-muted small">(optional)</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  maxLength={300}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={deciding.status === 'rejected' ? 'Reason for rejection…' : 'e.g. Delivery at 8 AM on the start date'}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setDeciding(null)} disabled={busy}>Back</Button>
          {deciding && (
            <Button variant={ACTIONS[deciding.status].variant} onClick={submitDecision} disabled={busy}>
              {busy && <Spinner size="sm" className="me-2" />}
              {ACTIONS[deciding.status].label}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={Boolean(deleting)}
        title="Delete rental?"
        body={<>This permanently deletes rental <strong>{deleting?.code}</strong> ({deleting?.eventName}). Any reserved equipment is released.</>}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
}

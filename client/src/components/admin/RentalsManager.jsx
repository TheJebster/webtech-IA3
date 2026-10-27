import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Nav, Row, Table } from 'react-bootstrap';
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
  approved: { label: 'Approve', short: 'Approve', verb: 'approved' },
  rejected: { label: 'Reject', short: 'Reject', verb: 'rejected' },
  returned: { label: 'Mark returned', short: 'Returned', verb: 'marked as returned' },
  cancelled: { label: 'Cancel booking', short: 'Cancel', verb: 'cancelled' },
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
      notify(`Rental ${res.rental.code} ${ACTIONS[deciding.status].verb}.`);
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
  // The next valid status changes for a rental, as text actions
  const actionButtons = (r, full = false) =>
    (NEXT[r.status] || []).map((next) => (
      <button
        key={next}
        type="button"
        className={`text-action ${next === 'approved' || next === 'returned' ? '' : 'quiet'}`}
        aria-label={`${ACTIONS[next].label} ${r.code}`}
        onClick={() => openDecision(r, next)}
      >
        {full ? ACTIONS[next].label : ACTIONS[next].short}
      </button>
    ));

  return (
    <div>
      <Nav variant="pills" activeKey={status} onSelect={(k) => { setStatus(k); setPage(1); }} className="mb-4 flex-nowrap overflow-auto pb-1">
        {STATUS_TABS.map((s) => (
          <Nav.Item key={s || 'all'}>
            <Nav.Link eventKey={s} className="text-nowrap">
              {s ? STATUS_META[s].label : 'All'} <span className="badge">{s ? data.counts?.[s] || 0 : total}</span>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Form.Control
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search event, venue, customer or item…"
            aria-label="Search rentals"
          />
        </Col>
      </Row>

      {loading ? (
        <PageLoader />
      ) : data.items.length === 0 ? (
        <EmptyState title={`No ${status ? STATUS_META[status].label.toLowerCase() : ''} rentals`} text="Rental requests from customers will appear here." />
      ) : (
        <Table responsive className="mb-4 ops-table">
          <thead>
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
                <td className="text-end text-nowrap d-none d-sm-table-cell">{formatCurrency(r.totalCost)}</td>
                <td><RentalStatusBadge status={r.status} /></td>
                <td className="text-end">
                  <span className="action-row justify-content-end flex-nowrap">
                    <button type="button" className="text-action quiet" aria-label={`View ${r.code}`} onClick={() => setViewing(r)}>View</button>
                    {actionButtons(r)}
                    <button type="button" className="text-action quiet" aria-label={`Delete ${r.code}`} onClick={() => setDeleting(r)}>Delete</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Paginator page={page} pages={data.pages} onChange={setPage} />

      <RentalDetailsModal
        rental={viewing}
        show={Boolean(viewing) && !deciding && !deleting}
        showCustomer
        onClose={() => setViewing(null)}
        footer={viewing && actionButtons(viewing, true)}
      />

      <Modal show={Boolean(deciding)} onHide={busy ? undefined : () => setDeciding(null)} centered>
        <Modal.Header closeButton={!busy}>
          <Modal.Title>{deciding && `${ACTIONS[deciding.status].label} ${deciding.rental.code}?`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deciding && (
            <>
              <p className="mb-4">
                <strong>{deciding.rental.eventName}</strong> for {deciding.rental.customerName} ·{' '}
                {formatDayRange(deciding.rental.startDate, deciding.rental.endDate)} · {formatCurrency(deciding.rental.totalCost)}
              </p>
              <Form.Group controlId="adminNote">
                <Form.Label>Note to customer (optional)</Form.Label>
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
          {deciding && (
            <Button variant="primary" onClick={submitDecision} disabled={busy}>
              {busy ? 'Working…' : ACTIONS[deciding.status].label}
            </Button>
          )}
          <Button variant="outline-secondary" onClick={() => setDeciding(null)} disabled={busy}>Back</Button>
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
    </div>
  );
}

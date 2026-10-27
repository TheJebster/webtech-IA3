import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api, { parseError } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency, todayInput } from '../../utils/format';
import { hasErrors } from '../../utils/validators';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import usePageTitle from '../../hooks/usePageTitle';

const MAX_DAYS = 30;
const EMPTY_EVENT = { eventName: '', venue: '', startDate: '', endDate: '', notes: '' };
const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1;

function validateEvent(form) {
  const today = todayInput();
  let endDate = '';
  if (!form.endDate) endDate = 'End date is required';
  else if (form.startDate && form.endDate < form.startDate) endDate = 'End date must be on or after the start date';
  else if (form.startDate && dayDiff(form.startDate, form.endDate) > MAX_DAYS) endDate = `Rentals can be at most ${MAX_DAYS} days`;
  return {
    eventName: form.eventName.trim() ? '' : 'Event name is required',
    venue: form.venue.trim() ? '' : 'Venue is required',
    startDate: !form.startDate ? 'Start date is required' : form.startDate < today ? 'Start date cannot be in the past' : '',
    endDate,
    notes: form.notes.length > 500 ? 'Notes are too long (max 500)' : '',
  };
}

export default function RentalRequest() {
  usePageTitle('Rental request');
  const { items, updateQuantity, removeItem, clear } = useCart();
  const notify = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_EVENT);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const datesValid = form.startDate && form.endDate && !validateEvent(form).startDate && !validateEvent(form).endDate;
  const quoteKey = useDebounce(
    JSON.stringify({ items: items.map((i) => ({ equipment: i.equipment._id, quantity: i.quantity })), s: form.startDate, e: form.endDate }),
    300
  );

  // Live price + availability whenever items or dates change
  useEffect(() => {
    const { items: lines, s, e } = JSON.parse(quoteKey);
    if (!lines.length || !datesValid || lines.some((l) => !(l.quantity >= 1))) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    api
      .post('/rentals/quote', { items: lines, startDate: s, endDate: e })
      .then(({ data }) => !cancelled && setQuote(data))
      .catch(() => !cancelled && setQuote(null))
      .finally(() => !cancelled && setQuoting(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey]);

  const lineFor = useMemo(() => {
    const map = new Map((quote?.lines || []).map((l) => [String(l.equipment), l]));
    return (id) => map.get(id);
  }, [quote]);

  const estimatedTotal = useMemo(() => items.reduce((sum, i) => sum + i.equipment.dailyRate * (i.quantity || 0), 0), [items]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  // An empty box is allowed while typing; it snaps back to 1 on blur
  const setQty = (id, value) => {
    if (value === '') return updateQuantity(id, '');
    updateQuantity(id, Math.max(1, Math.min(1000, Math.floor(Number(value)) || 1)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const nextErrors = validateEvent(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    if (items.some((i) => !(i.quantity >= 1))) {
      setServerError('Every item needs a quantity of at least 1.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/rentals', {
        ...form,
        eventName: form.eventName.trim(),
        venue: form.venue.trim(),
        notes: form.notes.trim(),
        items: items.map((i) => ({ equipment: i.equipment._id, quantity: i.quantity })),
      });
      clear();
      notify(`Request ${data.rental.code} submitted! We’ll review it shortly.`);
      navigate('/my-rentals', { replace: true });
    } catch (err) {
      const parsed = parseError(err);
      setServerError(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <Container>
        <PageHeader title="Rental request" />
        <EmptyState title="Your rental request is empty" text="Browse the catalog and add the equipment you need for your event.">
          <Link to="/catalog" className="btn btn-primary">Browse equipment</Link>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader title="Rental request" subtitle="Review your equipment, choose event dates and send the request for approval." />
      <Form noValidate onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col lg={7}>
            <div className="panel">
            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <h2 className="mb-0">Equipment ({items.length})</h2>
              <Link to="/catalog" className="link-arrow">Add more</Link>
            </div>
            {items.map(({ equipment, quantity }) => {
              const line = lineFor(equipment._id);
              return (
                <div key={equipment._id} className="request-line mb-4">
                  <div className="d-flex justify-content-between gap-3">
                    <Link to={`/equipment/${equipment._id}`} className="fw-semibold">{equipment.name}</Link>
                    <span className="text-nowrap">
                      {line ? formatCurrency(line.subtotal) : `${formatCurrency(equipment.dailyRate * (quantity || 0))} / day`}
                    </span>
                  </div>
                  <div className="small text-muted mb-3">{formatCurrency(equipment.dailyRate)} / day</div>
                  <div className="action-row">
                    <button type="button" className="text-action" aria-label="Decrease quantity" onClick={() => setQty(equipment._id, (quantity || 1) - 1)} disabled={!quantity || quantity <= 1}>−</button>
                    <Form.Control
                      className="text-center"
                      style={{ width: 70 }}
                      type="number"
                      min="1"
                      value={quantity}
                      aria-label={`Quantity of ${equipment.name}`}
                      onChange={(e) => setQty(equipment._id, e.target.value)}
                      onBlur={() => !quantity && setQty(equipment._id, 1)}
                    />
                    <button type="button" className="text-action" aria-label="Increase quantity" onClick={() => setQty(equipment._id, (quantity || 0) + 1)}>+</button>
                    <span className="small ms-2">
                      {line ? (
                        line.ok ? (
                          <span className="text-muted">{line.available} available for your dates</span>
                        ) : (
                          <strong>{line.missing ? 'No longer available' : `Only ${line.available} available`}</strong>
                        )
                      ) : (
                        <span className="text-muted">Pick dates to check availability</span>
                      )}
                    </span>
                    <button type="button" className="text-action quiet ms-auto" aria-label={`Remove ${equipment.name}`} onClick={() => removeItem(equipment._id)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </Col>

          <Col lg={5}>
            <div className="panel sticky-lg-top request-summary" style={{ top: 72 }}>
              <h2 className="mb-4">Event details</h2>
              {serverError && <Alert variant="danger" className="small">{serverError}</Alert>}
              <Row className="g-4">
                <Col xs={12}>
                  <Form.Group controlId="eventName">
                    <Form.Label>Event name</Form.Label>
                    <Form.Control name="eventName" value={form.eventName} onChange={handleChange} isInvalid={Boolean(errors.eventName)} placeholder="College cultural fest" />
                    <Form.Control.Feedback type="invalid">{errors.eventName}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group controlId="venue">
                    <Form.Label>Venue</Form.Label>
                    <Form.Control name="venue" value={form.venue} onChange={handleChange} isInvalid={Boolean(errors.venue)} placeholder="Main Auditorium, Coimbatore" />
                    <Form.Control.Feedback type="invalid">{errors.venue}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group controlId="startDate">
                    <Form.Label>Start date</Form.Label>
                    <Form.Control type="date" name="startDate" min={todayInput()} value={form.startDate} onChange={handleChange} isInvalid={Boolean(errors.startDate)} />
                    <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group controlId="endDate">
                    <Form.Label>End date</Form.Label>
                    <Form.Control type="date" name="endDate" min={form.startDate || todayInput()} value={form.endDate} onChange={handleChange} isInvalid={Boolean(errors.endDate)} />
                    <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group controlId="notes">
                    <Form.Label>Notes (optional)</Form.Label>
                    <Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={handleChange} isInvalid={Boolean(errors.notes)} placeholder="Delivery time, setup needs…" />
                    <Form.Control.Feedback type="invalid">{errors.notes}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="stack mt-5 mb-4">
                <div className="d-flex justify-content-between"><span className="text-muted">Daily total</span><span>{formatCurrency(estimatedTotal)} / day</span></div>
                <div className="d-flex justify-content-between"><span className="text-muted">Rental days</span><span>{quote ? quote.days : '—'}</span></div>
                <div className="d-flex justify-content-between align-items-baseline">
                  <span className="text-muted">Estimated total</span>
                  <span className="price-xl">{quoting ? '…' : quote ? formatCurrency(quote.totalCost) : '—'}</span>
                </div>
              </div>
              {quote && !quote.ok && (
                <Alert variant="warning" className="small">
                  Some items don’t have enough stock for these dates. Reduce the quantity or pick other dates.
                </Alert>
              )}
              <Button type="submit" variant="primary" disabled={submitting || quoting || (quote && !quote.ok)}>
                {submitting ? 'Submitting…' : 'Submit rental request'}
              </Button>
              <p className="small text-muted mt-3 mb-0">You won’t be charged now — our team will confirm your booking.</p>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

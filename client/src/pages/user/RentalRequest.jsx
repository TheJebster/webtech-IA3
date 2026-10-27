import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarEvent, CartX, DashLg, ExclamationTriangleFill, PlusLg, Trash3 } from 'react-bootstrap-icons';
import api, { parseError } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency, todayInput } from '../../utils/format';
import { hasErrors } from '../../utils/validators';
import PageHeader from '../../components/PageHeader';
import EquipmentImage from '../../components/EquipmentImage';
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
      <Container className="py-4">
        <PageHeader title="Rental request" sticker="🛒" />
        <Card className="">
          <EmptyState icon={CartX} title="Your rental request is empty" text="Browse the catalog and add the equipment you need for your event.">
            <Link to="/catalog" className="btn btn-primary">Browse equipment</Link>
          </EmptyState>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <PageHeader title="Rental request" sticker="🛒" subtitle="Review your equipment, choose event dates and send the request for approval." />
      <Form noValidate onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={7}>
            <Card className="">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
                <span className="fw-semibold">Equipment ({items.length})</span>
                <Link to="/catalog" className="small">+ Add more</Link>
              </Card.Header>
              <Card.Body className="p-0">
                {items.map(({ equipment, quantity }) => {
                  const line = lineFor(equipment._id);
                  return (
                    <div key={equipment._id} className="d-flex gap-3 p-3 border-bottom request-line">
                      <div style={{ width: 72 }} className="flex-shrink-0">
                        <EquipmentImage item={equipment} height={64} iconSize={26} />
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between gap-2">
                          <Link to={`/equipment/${equipment._id}`} className="fw-semibold text-body text-decoration-none">{equipment.name}</Link>
                          <Button variant="link" size="sm" className="text-danger p-0" aria-label={`Remove ${equipment.name}`} onClick={() => removeItem(equipment._id)}>
                            <Trash3 />
                          </Button>
                        </div>
                        <div className="small text-muted mb-2">{formatCurrency(equipment.dailyRate)} / day</div>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                          <InputGroup size="sm" style={{ width: 130 }}>
                            <Button variant="outline-secondary" aria-label="Decrease quantity" onClick={() => setQty(equipment._id, (quantity || 1) - 1)} disabled={!quantity || quantity <= 1}><DashLg /></Button>
                            <Form.Control
                              className="text-center"
                              type="number"
                              min="1"
                              value={quantity}
                              aria-label={`Quantity of ${equipment.name}`}
                              onChange={(e) => setQty(equipment._id, e.target.value)}
                              onBlur={() => !quantity && setQty(equipment._id, 1)}
                            />
                            <Button variant="outline-secondary" aria-label="Increase quantity" onClick={() => setQty(equipment._id, (quantity || 0) + 1)}><PlusLg /></Button>
                          </InputGroup>
                          {line ? (
                            line.ok ? (
                              <span className="small text-success">{line.available} available for your dates</span>
                            ) : (
                              <span className="small text-danger fw-semibold">
                                <ExclamationTriangleFill className="me-1" />
                                {line.missing ? 'No longer available' : `Only ${line.available} available`}
                              </span>
                            )
                          ) : (
                            <span className="small text-muted">Pick dates to check availability</span>
                          )}
                          <span className="fw-semibold">
                            {line ? formatCurrency(line.subtotal) : `${formatCurrency(equipment.dailyRate * (quantity || 0))}/day`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="sticky-lg-top" style={{ top: 80 }}>
              <Card.Body className="p-4">
                <h2 className="h4 mb-3 d-flex align-items-center gap-2"><CalendarEvent />Event details</h2>
                {serverError && <Alert variant="danger" className="small">{serverError}</Alert>}
                <Row className="g-3">
                  <Col xs={12}>
                    <Form.Group controlId="eventName">
                      <Form.Label>Event name <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="eventName" value={form.eventName} onChange={handleChange} isInvalid={Boolean(errors.eventName)} placeholder="e.g. College Cultural Fest" />
                      <Form.Control.Feedback type="invalid">{errors.eventName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group controlId="venue">
                      <Form.Label>Venue <span className="text-danger">*</span></Form.Label>
                      <Form.Control name="venue" value={form.venue} onChange={handleChange} isInvalid={Boolean(errors.venue)} placeholder="e.g. Main Auditorium, Coimbatore" />
                      <Form.Control.Feedback type="invalid">{errors.venue}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group controlId="startDate">
                      <Form.Label>Start date <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="date" name="startDate" min={todayInput()} value={form.startDate} onChange={handleChange} isInvalid={Boolean(errors.startDate)} />
                      <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group controlId="endDate">
                      <Form.Label>End date <span className="text-danger">*</span></Form.Label>
                      <Form.Control type="date" name="endDate" min={form.startDate || todayInput()} value={form.endDate} onChange={handleChange} isInvalid={Boolean(errors.endDate)} />
                      <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group controlId="notes">
                      <Form.Label>Notes <span className="text-muted small">(optional)</span></Form.Label>
                      <Form.Control as="textarea" rows={2} name="notes" value={form.notes} onChange={handleChange} isInvalid={Boolean(errors.notes)} placeholder="Delivery time, setup needs…" />
                      <Form.Control.Feedback type="invalid">{errors.notes}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <hr />
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Daily total</span>
                  <span>{formatCurrency(estimatedTotal)} / day</span>
                </div>
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>Rental days</span>
                  <span>{quote ? quote.days : '—'}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-semibold">Estimated total</span>
                  <span className="h4 fw-bold mb-0 text-primary">
                    {quoting ? <Spinner size="sm" /> : quote ? formatCurrency(quote.totalCost) : '—'}
                  </span>
                </div>
                {quote && !quote.ok && (
                  <Alert variant="warning" className="small py-2">
                    Some items don’t have enough stock for these dates. Reduce the quantity or pick other dates.
                  </Alert>
                )}
                <Button type="submit" size="lg" className="w-100" disabled={submitting || quoting || (quote && !quote.ok)}>
                  {submitting ? <><Spinner size="sm" className="me-2" />Submitting…</> : 'Submit rental request'}
                </Button>
                <p className="small text-muted text-center mt-2 mb-0">You won’t be charged now — our team will confirm your booking.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

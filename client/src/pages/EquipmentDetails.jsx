import { useEffect, useState } from 'react';
import { Breadcrumb, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { ArrowRepeat, CalendarCheck, ShieldCheck, Truck } from 'react-bootstrap-icons';
import usePageTitle from '../hooks/usePageTitle';
import api, { parseError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useAddToRequest from '../hooks/useAddToRequest';
import { formatCurrency } from '../utils/format';
import EquipmentImage from '../components/EquipmentImage';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/store/ProductCard';
import Availability from '../components/store/Availability';
import DateRangeFields from '../components/store/DateRangeFields';

export default function EquipmentDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { items: cartItems, dates, setDates } = useCart();
  const addToRequest = useAddToRequest();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  usePageTitle(item?.name || 'Equipment');

  const hasDates = Boolean(dates.start && dates.end);

  // Reload with availability whenever the item or the chosen dates change
  useEffect(() => {
    setError('');
    api
      .get(`/equipment/${id}`, { params: hasDates ? { start: dates.start, end: dates.end } : {} })
      .then(({ data }) => setItem(data.item))
      .catch((err) => setError(parseError(err).message));
  }, [id, hasDates, dates.start, dates.end]);

  useEffect(() => {
    if (!item?.category) return;
    api
      .get('/equipment', { params: { category: item.category, limit: 5, sort: 'popular' } })
      .then(({ data }) => setRelated(data.items.filter((r) => r._id !== item._id).slice(0, 4)))
      .catch(() => {});
  }, [item?.category, item?._id]);

  if (error) {
    return (
      <Container>
        <EmptyState title="Equipment not available" text={error}>
          <Link to={isAdmin ? '/admin/operations' : '/catalog'} className="btn btn-primary">Back to {isAdmin ? 'operations' : 'equipment'}</Link>
        </EmptyState>
      </Container>
    );
  }
  if (!item || item._id !== id) return <PageLoader />;

  const max = hasDates && item.available !== undefined ? item.available : item.quantityTotal;
  const clamp = (n) => Math.max(1, Math.min(Math.max(max, 1), n));
  const inCart = cartItems.find((i) => i.equipment._id === item._id);

  const handleAdd = () => {
    if (addToRequest({ equipment: item, quantity: Number(qty) || 1 })) setQty(1);
  };

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/catalog' }}>Equipment</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/catalog?category=${encodeURIComponent(item.category)}` }}>{item.category}</Breadcrumb.Item>
        <Breadcrumb.Item active>{item.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4 g-lg-5">
        <Col lg={7}>
          <div className="product-media"><EquipmentImage item={item} size="hero" /></div>

          <div className="mt-4">
            <h2 className="h3">About this item</h2>
            {item.description && <p>{item.description}</p>}
            {item.features?.length > 0 && (
              <>
                <h3 className="mt-4">Key features</h3>
                <ul className="feature-list">
                  {item.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </>
            )}
          </div>
        </Col>

        <Col lg={5}>
          <div className="buy-box panel">
            <span className="eyebrow">{item.category}</span>
            <h1 className="mb-2">{item.name}</h1>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge">Condition: {item.condition}</span>
              <span className="badge">{item.quantityTotal} units in stock</span>
              {!item.isActive && <span className="badge">Hidden from customers</span>}
            </div>
            <div className="mb-3">
              <span className="price-xl">{formatCurrency(item.dailyRate)}</span> <span className="text-muted">/ day</span>
            </div>

            {isAdmin ? (
              <Link to="/admin/operations" className="btn btn-primary w-100">Manage in Operations</Link>
            ) : (
              <>
                <div className="mb-3">
                  <DateRangeFields
                    start={dates.start}
                    end={dates.end}
                    onChange={(next) => setDates(next)}
                    idPrefix="product-dates"
                  />
                  <div className="mt-2 small">
                    {hasDates && item.available !== undefined
                      ? <Availability available={item.available} total={item.quantityTotal} />
                      : <span className="text-muted">Choose your event dates to check availability.</span>}
                  </div>
                </div>

                <div className="d-flex gap-2 align-items-stretch mb-2">
                  <div className="qty-stepper">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => clamp((Number(q) || 1) - 1))} disabled={Number(qty) <= 1}>−</button>
                    <Form.Control
                      type="number"
                      min="1"
                      max={max}
                      value={qty}
                      aria-label="Quantity"
                      onChange={(e) => setQty(e.target.value === '' ? '' : clamp(Math.floor(Number(e.target.value)) || 1))}
                      onBlur={() => setQty((q) => q || 1)}
                    />
                    <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => clamp((Number(q) || 0) + 1))} disabled={Number(qty) >= max}>+</button>
                  </div>
                  <button type="button" className="btn btn-primary flex-grow-1" onClick={handleAdd} disabled={max < 1}>
                    Add to rental request
                  </button>
                </div>
                {inCart && (
                  <p className="small mb-2">
                    {inCart.quantity} already in your request · <Link to="/rental-request">Review request &amp; pick dates →</Link>
                  </p>
                )}
              </>
            )}

            <hr />
            <ul className="perks">
              <li className="d-flex gap-2"><Truck className="mt-1 flex-shrink-0" /> Delivery, setup and pickup by our crew</li>
              <li className="d-flex gap-2"><ShieldCheck className="mt-1 flex-shrink-0" /> Tested before every event</li>
              <li className="d-flex gap-2"><CalendarCheck className="mt-1 flex-shrink-0" /> Charged per day, start and end dates included</li>
              <li className="d-flex gap-2"><ArrowRepeat className="mt-1 flex-shrink-0" /> Free cancellation while the request is pending</li>
            </ul>
          </div>
        </Col>
      </Row>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="mb-0">You may also need</h2>
            <Link to={`/catalog?category=${encodeURIComponent(item.category)}`} className="link-arrow">More {item.category}</Link>
          </div>
          <div className="product-grid">
            {related.map((r) => <ProductCard key={r._id} item={r} />)}
          </div>
        </section>
      )}
    </Container>
  );
}

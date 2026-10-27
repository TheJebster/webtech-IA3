import { useEffect, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import api, { parseError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';
import EquipmentImage from '../components/EquipmentImage';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';

export default function EquipmentDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { items: cartItems, addItem } = useCart();
  const notify = useToast();
  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  usePageTitle(item?.name || 'Equipment');
  const [error, setError] = useState('');

  useEffect(() => {
    setItem(null);
    setError('');
    api
      .get(`/equipment/${id}`)
      .then(({ data }) => setItem(data.item))
      .catch((err) => setError(parseError(err).message));
  }, [id]);

  const back = (
    <button type="button" className="text-action quiet mb-5" onClick={() => navigate(-1)}>← Back</button>
  );

  if (error) {
    return (
      <Container>
        {back}
        <EmptyState title="Equipment not available" text={error}>
          <Link to={isAdmin ? '/admin/operations' : '/catalog'} className="btn btn-primary">Back to {isAdmin ? 'operations' : 'equipment'}</Link>
        </EmptyState>
      </Container>
    );
  }
  if (!item) return <PageLoader />;

  const inCart = cartItems.find((i) => i.equipment._id === item._id);
  const handleAdd = () => {
    const quantity = Number(qty) || 1;
    addItem(item, quantity);
    notify(`Added ${quantity} × ${item.name} to your rental request.`);
    setQty(1);
  };
  const clamp = (n) => Math.max(1, Math.min(item.quantityTotal, n));

  return (
    <Container>
      {back}
      <Row className="g-5">
        {item.imageUrl && (
          <Col lg={6}>
            <EquipmentImage item={item} height={380} />
          </Col>
        )}
        <Col lg={item.imageUrl ? 6 : 8}>
          <div className="text-muted mb-2">
            {item.category} · Condition: {item.condition}{!item.isActive && ' · Hidden from customers'}
          </div>
          <h1 className="mb-3">{item.name}</h1>
          <div className="mb-4">
            <span className="price-xl">{formatCurrency(item.dailyRate)}</span> <span className="text-muted">/ day</span>
          </div>
          {item.description && <p className="mb-5" style={{ maxWidth: 620 }}>{item.description}</p>}

          {item.features?.length > 0 && (
            <div className="mb-5">
              <h2 className="mb-3">Key features</h2>
              <ul className="plain-list">
                {item.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}

          <p className="mb-5"><span className="text-muted">Units in our inventory</span> <strong>{item.quantityTotal}</strong></p>

          {!isAdmin && (
            <div>
              <h2 className="mb-3">Rent this for your event</h2>
              <div className="action-row">
                <button type="button" className="text-action" aria-label="Decrease quantity" onClick={() => setQty((q) => clamp((Number(q) || 1) - 1))} disabled={Number(qty) <= 1}>−</button>
                <Form.Control
                  className="text-center"
                  style={{ width: 70 }}
                  type="number"
                  min="1"
                  max={item.quantityTotal}
                  value={qty}
                  aria-label="Quantity"
                  onChange={(e) => setQty(e.target.value === '' ? '' : clamp(Math.floor(Number(e.target.value)) || 1))}
                  onBlur={() => setQty((q) => q || 1)}
                />
                <button type="button" className="text-action" aria-label="Increase quantity" onClick={() => setQty((q) => clamp((Number(q) || 0) + 1))} disabled={Number(qty) >= item.quantityTotal}>+</button>
                <button type="button" className="btn btn-primary ms-3" onClick={handleAdd} disabled={item.quantityTotal < 1}>Add to rental request</button>
              </div>
              {inCart && (
                <p className="mt-4 mb-0">
                  <span className="text-muted">{inCart.quantity} already in your request.</span>{' '}
                  <Link to="/rental-request">Review request and pick dates →</Link>
                </p>
              )}
              <p className="small text-muted mt-3 mb-0">Availability for your dates is checked on the request page.</p>
            </div>
          )}

          {isAdmin && <Link to="/admin/operations" className="btn btn-primary">Manage in Operations</Link>}
        </Col>
      </Row>
    </Container>
  );
}

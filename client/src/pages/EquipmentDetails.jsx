import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Cart3, CheckCircleFill, DashLg, PencilSquare, PlusLg } from 'react-bootstrap-icons';
import api, { parseError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';
import EquipmentImage from '../components/EquipmentImage';
import ConditionBadge from '../components/ConditionBadge';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';
import usePageTitle from '../hooks/usePageTitle';

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
    <button type="button" className="btn btn-link px-0 mb-3 text-decoration-none" onClick={() => navigate(-1)}>
      <ArrowLeft className="me-1" /> Back
    </button>
  );

  if (error) {
    return (
      <Container className="py-4">
        {back}
        <EmptyState title="Equipment not available" text={error}>
          <Link to={isAdmin ? '/admin/operations' : '/catalog'} className="btn btn-primary">Back to {isAdmin ? 'operations' : 'catalog'}</Link>
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

  return (
    <Container className="py-4">
      {back}
      <Row className="g-4">
        <Col lg={6}>
          <EquipmentImage item={item} height={340} iconSize={110} />
        </Col>
        <Col lg={6}>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Badge bg="light" text="dark" className="border fw-medium">{item.category}</Badge>
            <ConditionBadge condition={item.condition} prefix="Condition: " />
            {!item.isActive && <Badge bg="secondary">Hidden from customers</Badge>}
          </div>
          <h1 className="heading-lg mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 44px)' }}>{item.name}</h1>
          <div className="mb-3">
            <span className="display-6 fw-bold">{formatCurrency(item.dailyRate)}</span>
            <span className="text-muted"> / day</span>
          </div>
          {item.description && <p className="text-muted">{item.description}</p>}

          {item.features?.length > 0 && (
            <Card className="mb-3">
              <Card.Body>
                <h2 className="h6 fw-bold mb-2">Key features</h2>
                <ul className="list-unstyled mb-0">
                  {item.features.map((f) => (
                    <li key={f} className="d-flex gap-2 mb-1"><CheckCircleFill className="text-success mt-1 flex-shrink-0" />{f}</li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}

          <Card className="mb-3">
            <Card.Body className="d-flex justify-content-between">
              <span className="text-muted">Units in our inventory</span>
              <strong>{item.quantityTotal}</strong>
            </Card.Body>
          </Card>

          {!isAdmin && (
            <Card className="mb-3">
              <Card.Body>
                <h2 className="h6 fw-bold mb-3">Rent this for your event</h2>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <InputGroup style={{ width: 140 }}>
                    <Button variant="outline-secondary" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, (Number(q) || 1) - 1))} disabled={qty <= 1}><DashLg /></Button>
                    <Form.Control
                      className="text-center"
                      type="number"
                      min="1"
                      max={item.quantityTotal}
                      value={qty}
                      aria-label="Quantity"
                      onChange={(e) => setQty(e.target.value === '' ? '' : Math.max(1, Math.min(item.quantityTotal, Math.floor(Number(e.target.value)) || 1)))}
                      onBlur={() => setQty((q) => q || 1)}
                    />
                    <Button variant="outline-secondary" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(item.quantityTotal, (Number(q) || 0) + 1))} disabled={qty >= item.quantityTotal}><PlusLg /></Button>
                  </InputGroup>
                  <Button onClick={handleAdd} disabled={item.quantityTotal < 1} className="flex-grow-1">
                    <Cart3 className="me-2" />Add to rental request
                  </Button>
                </div>
                {inCart && (
                  <div className="small mt-2">
                    {inCart.quantity} already in your request · <Link to="/rental-request">Review request &amp; pick dates →</Link>
                  </div>
                )}
                <div className="small text-muted mt-2">Availability for your dates is checked on the request page.</div>
              </Card.Body>
            </Card>
          )}

          {isAdmin && (
            <Link to="/admin/operations" className="btn btn-outline-primary">
              <PencilSquare className="me-1" /> Manage in Operations
            </Link>
          )}
        </Col>
      </Row>
    </Container>
  );
}

import { useEffect, useState } from 'react';
import { Badge, Card, Col, Container, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircleFill, PencilSquare } from 'react-bootstrap-icons';
import api, { parseError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import EquipmentImage from '../components/EquipmentImage';
import ConditionBadge from '../components/ConditionBadge';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';

export default function EquipmentDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
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

  return (
    <Container className="py-4">
      {back}
      <Row className="g-4">
        <Col lg={6}>
          <EquipmentImage item={item} height={340} iconSize={110} className="shadow-sm" />
        </Col>
        <Col lg={6}>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <Badge bg="light" text="dark" className="border fw-medium">{item.category}</Badge>
            <ConditionBadge condition={item.condition} prefix="Condition: " />
            {!item.isActive && <Badge bg="secondary">Hidden from customers</Badge>}
          </div>
          <h1 className="h2 fw-bold">{item.name}</h1>
          <div className="mb-3">
            <span className="display-6 fw-bold text-primary">{formatCurrency(item.dailyRate)}</span>
            <span className="text-muted"> / day</span>
          </div>
          {item.description && <p className="text-muted">{item.description}</p>}

          {item.features?.length > 0 && (
            <Card className="border-0 shadow-sm mb-3">
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

          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="d-flex justify-content-between">
              <span className="text-muted">Units in our inventory</span>
              <strong>{item.quantityTotal}</strong>
            </Card.Body>
          </Card>

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

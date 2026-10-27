import { useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, XLg } from 'react-bootstrap-icons';
import api, { parseError } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import { categoryMeta } from '../../utils/categories';
import PageHeader from '../../components/PageHeader';
import EquipmentImage from '../../components/EquipmentImage';
import Paginator from '../../components/Paginator';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import UserSummary from '../../components/UserSummary';
import usePageTitle from '../../hooks/usePageTitle';

const PAGE_SIZE = 12;

export default function Catalog() {
  usePageTitle('Browse equipment');
  // Filters live in the URL so the back button and shared links keep them
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'name';
  const page = Number(params.get('page')) || 1;

  const [search, setSearch] = useState(params.get('q') || '');
  const q = useDebounce(search);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };

  // Push the debounced search term into the URL
  useEffect(() => {
    if ((params.get('q') || '') !== q) update({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    api.get('/equipment/meta').then(({ data: res }) => setCategories(res.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get('/equipment', { params: { q: params.get('q') || undefined, category: category || undefined, sort, page, limit: PAGE_SIZE } })
      .then(({ data: res }) => setData(res))
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }, [params, category, sort, page]);

  const clearAll = () => {
    setSearch('');
    setParams({}, { replace: true });
  };

  return (
    <Container className="py-4">
      <PageHeader title="Browse equipment" sticker="🔊" subtitle="Find everything you need for your event — sound, lighting, staging, furniture and more." />
      <UserSummary />

      <Card className="mb-3">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text><Search /></InputGroup.Text>
                <Form.Control
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search speakers, lights, chairs…"
                  aria-label="Search equipment"
                />
                {search && (
                  <Button variant="outline-secondary" onClick={() => setSearch('')} aria-label="Clear search"><XLg /></Button>
                )}
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort by">
                <option value="name">Sort: Name A–Z</option>
                <option value="price_asc">Sort: Price low → high</option>
                <option value="price_desc">Sort: Price high → low</option>
                <option value="newest">Sort: Newest</option>
              </Form.Select>
            </Col>
          </Row>
          <div className="category-pills d-flex gap-2 mt-3 pb-1">
            <Button size="sm" variant={!category ? 'primary' : 'outline-secondary'} className="rounded-pill text-nowrap" onClick={() => update({ category: '' })}>
              All
            </Button>
            {categories.map((c) => {
              const Icon = categoryMeta(c.name).icon;
              return (
                <Button
                  key={c.name}
                  size="sm"
                  variant={category === c.name ? 'primary' : 'outline-secondary'}
                  className="rounded-pill text-nowrap d-inline-flex align-items-center gap-1"
                  onClick={() => update({ category: c.name })}
                >
                  <Icon /> {c.name} <span className="opacity-75">({c.count})</span>
                </Button>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">
          {loading ? 'Loading…' : `${data.total} item${data.total === 1 ? '' : 's'} found`}
        </small>
        {(params.get('q') || category) && (
          <Button variant="link" size="sm" className="p-0" onClick={clearAll}>Clear filters</Button>
        )}
      </div>

      {error ? (
        <EmptyState title="Couldn’t load equipment" text={error} />
      ) : loading ? (
        <PageLoader />
      ) : data.items.length === 0 ? (
        <EmptyState title="No equipment matches your search" text="Try another keyword or category.">
          <Button variant="outline-primary" onClick={clearAll}>Show all equipment</Button>
        </EmptyState>
      ) : (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-3 mb-4">
          {data.items.map((item) => (
            <Col key={item._id}>
              <Card className="h-100 equipment-card">
                <EquipmentImage item={item} height={160} rounded={false} className="card-img-top" />
                <Card.Body className="d-flex flex-column">
                  <div className="mb-1"><Badge bg="light" text="dark" className="border fw-medium">{item.category}</Badge></div>
                  <Card.Title as="h2" className="h6 fw-bold mb-1">{item.name}</Card.Title>
                  <Card.Text className="small text-muted line-clamp-2 mb-3">{item.description}</Card.Text>
                  <div className="mt-auto d-flex justify-content-between align-items-end">
                    <div>
                      <span className="fw-bold fs-5">{formatCurrency(item.dailyRate)}</span>
                      <span className="small text-muted"> / day</span>
                    </div>
                    <Link to={`/equipment/${item._id}`} className="btn btn-sm btn-outline-primary stretched-link">Details</Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Paginator page={page} pages={data.pages} onChange={(p) => { update({ page: String(p) }); window.scrollTo(0, 0); }} />
    </Container>
  );
}

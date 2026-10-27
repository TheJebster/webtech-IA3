import { useEffect, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import api, { parseError } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import EquipmentImage from '../../components/EquipmentImage';
import Paginator from '../../components/Paginator';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import UserSummary from '../../components/UserSummary';

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
    <Container>
      <PageHeader title="Equipment" subtitle="Sound, lighting, staging, furniture and more for your event." />
      <UserSummary />

      <Row className="g-2 mb-3">
        <Col md={8}>
          <Form.Control
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search speakers, lights, chairs…"
            aria-label="Search equipment"
          />
        </Col>
        <Col md={4}>
          <Form.Select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort by">
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price, low to high</option>
            <option value="price_desc">Price, high to low</option>
            <option value="newest">Newest</option>
          </Form.Select>
        </Col>
      </Row>

      <div className="filter-row category-pills mb-4" role="group" aria-label="Category">
        <button type="button" className={`text-action ${!category ? 'active' : ''}`} onClick={() => update({ category: '' })}>All</button>
        {categories.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`text-action ${category === c.name ? 'active' : ''}`}
            onClick={() => update({ category: c.name })}
          >
            {c.name} <span className="text-muted">{c.count}</span>
          </button>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-baseline mb-4 small">
        <span className="text-muted">{loading ? 'Loading…' : `${data.total} item${data.total === 1 ? '' : 's'}`}</span>
        {(params.get('q') || category) && (
          <button type="button" className="text-action quiet" onClick={clearAll}>Clear filters</button>
        )}
      </div>

      {error ? (
        <EmptyState title="Couldn’t load equipment" text={error} />
      ) : loading ? (
        <PageLoader />
      ) : data.items.length === 0 ? (
        <EmptyState title="Nothing matches your search" text="Try another keyword or category.">
          <button type="button" className="text-action" onClick={clearAll}>Show all equipment</button>
        </EmptyState>
      ) : (
        <div className="catalog-grid mb-4">
          {data.items.map((item) => (
            <Link key={item._id} to={`/equipment/${item._id}`} className="catalog-item equipment-card">
              <EquipmentImage item={item} height={180} />
              <span className="catalog-meta">{item.category}</span>
              <span className="catalog-name card-title">{item.name}</span>
              <span className="catalog-desc">{item.description}</span>
              <span>{formatCurrency(item.dailyRate)} <span className="text-muted">/ day</span></span>
            </Link>
          ))}
        </div>
      )}

      <Paginator page={page} pages={data.pages} onChange={(p) => { update({ page: String(p) }); window.scrollTo(0, 0); }} />
    </Container>
  );
}

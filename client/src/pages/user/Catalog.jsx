import { useEffect, useState } from 'react';
import { Breadcrumb, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { Funnel } from 'react-bootstrap-icons';
import usePageTitle from '../../hooks/usePageTitle';
import api, { parseError } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatDayRange } from '../../utils/format';
import ProductCard from '../../components/store/ProductCard';
import DateRangeFields from '../../components/store/DateRangeFields';
import Paginator from '../../components/Paginator';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import UserSummary from '../../components/UserSummary';
import SplitText from '../../motion/SplitText';

const PAGE_SIZE = 12;
const PRICE_BANDS = [
  { label: 'Under ₹1,000', min: '', max: '999' },
  { label: '₹1,000 – ₹3,000', min: '1000', max: '3000' },
  { label: 'Over ₹3,000', min: '3001', max: '' },
];

export default function Catalog() {
  usePageTitle('Browse equipment');
  const { user, isAdmin } = useAuth();
  const { dates, setDates } = useCart();

  // All filters live in the URL so links, refresh and the back button keep them
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'popular';
  const page = Number(params.get('page')) || 1;
  const minRate = params.get('minRate') || '';
  const maxRate = params.get('maxRate') || '';
  const start = params.get('start') || '';
  const end = params.get('end') || '';

  const [search, setSearch] = useState(params.get('q') || '');
  const q = useDebounce(search);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false); // phones: filters fold away

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };

  // Use dates picked elsewhere (home page, product page) when the URL has none
  useEffect(() => {
    if (!params.get('start') && dates.start && dates.end) update({ start: dates.start, end: dates.end });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dates arriving in the URL (e.g. from the home page search) become the shared event dates
  useEffect(() => {
    if (start && end && (start !== dates.start || end !== dates.end)) setDates({ start, end });
  }, [start, end, dates.start, dates.end, setDates]);

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
      .get('/equipment', {
        params: {
          q: params.get('q') || undefined,
          category: category || undefined,
          sort,
          page,
          limit: PAGE_SIZE,
          minRate: minRate || undefined,
          maxRate: maxRate || undefined,
          start: start && end ? start : undefined,
          end: start && end ? end : undefined,
        },
      })
      .then(({ data: res }) => setData(res))
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }, [params, category, sort, page, minRate, maxRate, start, end]);

  const changeDates = (next) => {
    if (next.start && next.end) setDates(next);
    update({ start: next.start, end: next.end && next.start ? next.end : '' });
  };

  const clearAll = () => {
    setSearch('');
    setDates({ start: '', end: '' });
    setParams(sort !== 'popular' ? { sort } : {}, { replace: true });
  };

  const chips = [
    params.get('q') && { key: 'q', label: `“${params.get('q')}”`, clear: () => { setSearch(''); update({ q: '' }); } },
    category && { key: 'category', label: category, clear: () => update({ category: '' }) },
    (minRate || maxRate) && {
      key: 'price',
      label: minRate && maxRate ? `${formatCurrency(minRate)} – ${formatCurrency(maxRate)}` : minRate ? `Over ${formatCurrency(Number(minRate) - 1)}` : `Under ${formatCurrency(Number(maxRate) + 1)}`,
      clear: () => update({ minRate: '', maxRate: '' }),
    },
    start && end && { key: 'dates', label: formatDayRange(start, end), clear: () => changeDates({ start: '', end: '' }) },
  ].filter(Boolean);

  return (
    <Container>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item active={!category} linkAs={Link} linkProps={{ to: '/catalog' }}>Equipment</Breadcrumb.Item>
        {category && <Breadcrumb.Item active>{category}</Breadcrumb.Item>}
      </Breadcrumb>
      <div className="page-header mb-3">
        <div>
          <SplitText as="h1" key={category} className="mb-0">{category || 'All equipment'}</SplitText>
          <p>Delivered, set up and picked up by our crew. Prices are per day.</p>
        </div>
      </div>
      {user && !isAdmin && <UserSummary />}

      <Row className="g-4">
        <Col lg={3}>
          <Button
            variant="outline-secondary"
            className="d-lg-none w-100 mb-2"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="catalog-filters"
          >
            <Funnel className="me-2" />{showFilters ? 'Hide filters' : `Filters${chips.length ? ` (${chips.length})` : ''}`}
          </Button>
          <aside id="catalog-filters" className={`filters panel ${showFilters ? '' : 'd-none d-lg-block'}`} aria-label="Filters">
            <div className="filter-group">
              <Form.Control
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment…"
                aria-label="Search equipment"
              />
            </div>
            <div className="filter-group">
              <h3>Event dates</h3>
              <DateRangeFields start={start} end={end} onChange={changeDates} idPrefix="catalog-dates" size="sm" stacked />
              <p className="small text-muted mt-2 mb-0">
                {start && end ? 'Showing how many units are free on these dates.' : 'Pick dates to see live availability.'}
              </p>
            </div>
            <div className="filter-group">
              <h3>Category</h3>
              <div className="category-pills" role="group" aria-label="Category">
                <button type="button" className={`cat-option ${!category ? 'active' : ''}`} onClick={() => update({ category: '' })}>
                  All <span className="count">{categories.reduce((s, c) => s + c.count, 0)}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`cat-option ${category === c.name ? 'active' : ''}`}
                    onClick={() => update({ category: c.name })}
                  >
                    {c.name} <span className="count">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h3>Price per day</h3>
              {PRICE_BANDS.map((b, i) => (
                <Form.Check
                  key={b.label}
                  type="radio"
                  name="price-band"
                  id={`price-band-${i}`}
                  label={b.label}
                  checked={minRate === b.min && maxRate === b.max}
                  onChange={() => update({ minRate: b.min, maxRate: b.max })}
                />
              ))}
            </div>
          </aside>
        </Col>

        <Col lg={9}>
          <div className="results-bar">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-muted small me-1">{loading ? 'Loading…' : `${data.total} item${data.total === 1 ? '' : 's'}`}</span>
              {chips.map((c) => (
                <span key={c.key} className="chip">
                  {c.label}
                  <button type="button" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>×</button>
                </span>
              ))}
              {chips.length > 0 && (
                <button type="button" className="text-action" onClick={clearAll}>Clear filters</button>
              )}
            </div>
            <Form.Select value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort by" style={{ width: 'auto' }}>
              <option value="popular">Most popular</option>
              <option value="name">Name A–Z</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </Form.Select>
          </div>

          {error ? (
            <EmptyState title="Couldn’t load equipment" text={error} />
          ) : loading ? (
            <PageLoader />
          ) : data.items.length === 0 ? (
            <EmptyState title="No equipment matches your filters" text="Try another keyword, category or price range.">
              <button type="button" className="btn btn-outline-secondary" onClick={clearAll}>Show all equipment</button>
            </EmptyState>
          ) : (
            <div className="product-grid mb-4">
              {data.items.map((item) => <ProductCard key={item._id} item={item} />)}
            </div>
          )}

          <Paginator page={page} pages={data.pages} onChange={(p) => { update({ page: String(p) }); window.scrollTo(0, 0); }} />
        </Col>
      </Row>
    </Container>
  );
}

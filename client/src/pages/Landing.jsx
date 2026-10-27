import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, CheckCircleFill, ClipboardCheck, ShieldCheck, Stars, Truck, Search } from 'react-bootstrap-icons';
import usePageTitle from '../hooks/usePageTitle';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useAddToRequest from '../hooks/useAddToRequest';
import { categoryStyle, PACKAGES } from '../data/storefront';
import { formatCurrency, todayInput } from '../utils/format';
import ProductCard from '../components/store/ProductCard';
import ItemVisual from '../components/store/ItemVisual';

const TRUST = [
  { icon: Truck, title: 'Delivery & setup', text: 'Our crew delivers, installs and picks up.' },
  { icon: ShieldCheck, title: 'Tested before every event', text: 'Every item is checked before dispatch.' },
  { icon: CalendarCheck, title: 'Live availability', text: 'See what’s free for your exact dates.' },
  { icon: ClipboardCheck, title: 'No payment up front', text: 'We confirm your request before you pay.' },
];

const STEPS = [
  { title: 'Pick your dates', text: 'Tell us when your event is and see what’s available for those days.' },
  { title: 'Build your request', text: 'Add equipment or a ready-made kit. The total updates as you go.' },
  { title: 'We confirm & deliver', text: 'Our team approves the request, then delivers and sets up on the day.' },
];

function CategoryTile({ category }) {
  const { icon: Icon, from, to, accent } = categoryStyle(category.name);
  return (
    <Link
      to={`/catalog?category=${encodeURIComponent(category.name)}`}
      className="category-tile category-tile-icon"
      style={{ '--tile-from': from, '--tile-to': to, '--tile-accent': accent }}
    >
      <span className="item-visual-badge"><Icon size={28} /></span>
      <span>
        <strong>{category.name}</strong>
        <span>{category.count} item{category.count === 1 ? '' : 's'}</span>
      </span>
    </Link>
  );
}

export default function Landing() {
  usePageTitle(null);
  const { user, isAdmin } = useAuth();
  const { dates, setDates } = useCart();
  const addToRequest = useAddToRequest();
  const navigate = useNavigate();

  const [search, setSearch] = useState({ q: '', category: '', start: dates.start, end: dates.end });
  const [categories, setCategories] = useState([]);
  const [popular, setPopular] = useState([]);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    api.get('/equipment/meta').then(({ data }) => setCategories(data.categories)).catch(() => {});
    api.get('/equipment', { params: { sort: 'popular', limit: 8 } }).then(({ data }) => setPopular(data.items)).catch(() => {});
    api.get('/equipment', { params: { limit: 100 } }).then(({ data }) => setAllItems(data.items)).catch(() => {});
  }, []);

  // Resolve each kit's item names against the live catalogue to price it
  const kits = useMemo(() => {
    const byName = new Map(allItems.map((i) => [i.name, i]));
    return PACKAGES.map((p) => {
      const lines = p.items.map(([name, quantity]) => ({ equipment: byName.get(name), quantity })).filter((l) => l.equipment);
      return { ...p, lines, perDay: lines.reduce((sum, l) => sum + l.equipment.dailyRate * l.quantity, 0) };
    });
  }, [allItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.start && search.end) setDates({ start: search.start, end: search.end });
    const params = new URLSearchParams();
    if (search.q.trim()) params.set('q', search.q.trim());
    if (search.category) params.set('category', search.category);
    if (search.start && search.end) {
      params.set('start', search.start);
      params.set('end', search.end);
    }
    navigate(`/catalog${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <>
      <section className="hero hero-gradient">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={7}>
              <span className="hero-pill"><Stars /> Now booking for the wedding &amp; fest season</span>
              <h1 className="hero-title">
                Everything your event needs, <span className="text-gradient">delivered and set up.</span>
              </h1>
              <p className="hero-lead">
                Rent sound, lighting, staging, furniture and tents for weddings, concerts, college fests and corporate events —
                with live availability for your exact dates.
              </p>

              <Form className="hero-search" onSubmit={handleSearch} aria-label="Find equipment">
                <Row className="g-2 align-items-end">
                  <Col sm={12}>
                    <Form.Group controlId="hero-q">
                      <Form.Label>What do you need?</Form.Label>
                      <Form.Control value={search.q} onChange={(e) => setSearch({ ...search, q: e.target.value })} placeholder="Speakers, chairs, tents…" />
                    </Form.Group>
                  </Col>
                  <Col sm={4}>
                    <Form.Group controlId="hero-category">
                      <Form.Label>Category</Form.Label>
                      <Form.Select value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })}>
                        <option value="">All categories</option>
                        {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={6} sm={3}>
                    <Form.Group controlId="hero-start">
                      <Form.Label>Event from</Form.Label>
                      <Form.Control type="date" min={todayInput()} value={search.start} onChange={(e) => setSearch({ ...search, start: e.target.value, end: search.end && search.end < e.target.value ? e.target.value : search.end })} />
                    </Form.Group>
                  </Col>
                  <Col xs={6} sm={3}>
                    <Form.Group controlId="hero-end">
                      <Form.Label>To</Form.Label>
                      <Form.Control type="date" min={search.start || todayInput()} value={search.end} onChange={(e) => setSearch({ ...search, end: e.target.value })} />
                    </Form.Group>
                  </Col>
                  <Col sm={2} className="d-grid">
                    <Button type="submit" aria-label="Search equipment"><Search className="me-1" /> Search</Button>
                  </Col>
                </Row>
              </Form>
              <div className="hero-stats">
                <span><strong>{allItems.length || 24}+</strong> items</span>
                <span><strong>8</strong> categories</span>
                <span><strong>4</strong> ready-made kits</span>
              </div>
            </Col>

            {/* Decorative preview of the product experience */}
            <Col lg={5} className="d-none d-lg-block" aria-hidden="true">
              <div className="hero-mock">
                {popular.slice(0, 2).map((item, i) => (
                  <div key={item._id} className={`mock-card mock-card-${i}`}>
                    <div className="mock-visual"><ItemVisual item={item} /></div>
                    <div className="p-3">
                      <div className="small text-muted">{item.category}</div>
                      <div className="fw-bold" style={{ color: 'var(--ink)' }}>{item.name}</div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="price" style={{ fontSize: 16 }}>{formatCurrency(item.dailyRate)} <small>/ day</small></span>
                        <span className="avail avail-ok">Available</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mock-toast">
                  <CheckCircleFill className="text-success" />
                  <div>
                    <div className="fw-semibold" style={{ color: 'var(--ink)' }}>Request approved</div>
                    <div className="small text-muted">Delivery at 8 AM on your event day</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <div className="trust-bar">
        <Container>
          <Row xs={1} sm={2} lg={4} className="g-0">
            {TRUST.map(({ icon: Icon, title, text }) => (
              <Col key={title}>
                <div className="item pe-3">
                  <span className="icon"><Icon size={20} /></span>
                  <div><strong>{title}</strong><span>{text}</span></div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <section className="section">
        <Container>
          <div className="section-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2 className="mb-0">Shop by category</h2>
            </div>
            <Link to="/catalog" className="link-arrow">All equipment</Link>
          </div>
          <div className="category-grid">
            {categories.map((c) => (
              <CategoryTile key={c.name} category={c} />
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="section-head">
            <div>
              <span className="eyebrow">Customer favourites</span>
              <h2 className="mb-0">Most rented equipment</h2>
            </div>
            <Link to="/catalog?sort=popular" className="link-arrow">See more</Link>
          </div>
          <div className="product-grid">
            {popular.map((item) => <ProductCard key={item._id} item={item} />)}
          </div>
        </Container>
      </section>

      <section className="section-alt" id="packages">
        <Container>
          <div className="section-head">
            <div>
              <span className="eyebrow">Ready-made kits</span>
              <h2 className="mb-0">Packages for every occasion</h2>
              <p>Start from a kit, then adjust quantities on your request.</p>
            </div>
          </div>
          <Row xs={1} md={2} xl={4} className="g-3">
            {kits.map((kit) => (
              <Col key={kit.id}>
                <article className="package-card">
                  <div className="cover kit-cover" aria-hidden="true">
                    {kit.icons.map((Icon, i) => <span key={i} className="kit-icon"><Icon size={22} /></span>)}
                  </div>
                  <div className="body">
                    <h3 className="mb-1">{kit.name}</h3>
                    <p className="text-muted small mb-0">{kit.blurb}</p>
                    <ul>
                      {kit.lines.map((l) => <li key={l.equipment._id}>{l.quantity} × {l.equipment.name}</li>)}
                    </ul>
                    <div className="foot">
                      <span className="price">{formatCurrency(kit.perDay)} <small>/ day</small></span>
                      {!isAdmin && (
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => addToRequest(kit.lines)} disabled={!kit.lines.length}>
                          Add kit
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="section-head">
            <div>
              <span className="eyebrow">How it works</span>
              <h2 className="mb-0">Equipped in three steps</h2>
            </div>
          </div>
          <Row xs={1} md={3} className="g-4">
            {STEPS.map(({ title, text }, i) => (
              <Col key={title}>
                <div className="step-card">
                  <span className="step-no">{i + 1}</span>
                  <h3>{title}</h3>
                  <p className="text-muted mb-0">{text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {!user && (
        <section className="section">
          <Container>
            <div className="cta-band cta-gradient">
              <h2 className="mb-2">Planning an event?</h2>
              <p className="mb-4">Create a free account to save a rental request and track it from approval to pickup.</p>
              <div className="action-row">
                <Link to="/signup" className="btn btn-primary btn-lg">Create an account</Link>
                <Link to="/catalog" className="btn btn-outline-light btn-lg">Browse equipment</Link>
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

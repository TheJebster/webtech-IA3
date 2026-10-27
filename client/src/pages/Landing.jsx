import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, ClipboardCheck, ShieldCheck, Truck, Search } from 'react-bootstrap-icons';
import usePageTitle from '../hooks/usePageTitle';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useAddToRequest from '../hooks/useAddToRequest';
import { CATEGORY_IMAGES, PACKAGES } from '../data/storefront';
import { formatCurrency, todayInput } from '../utils/format';
import ProductCard from '../components/store/ProductCard';

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
      <section className="hero-banner hero" style={{ backgroundImage: 'url(/images/banners/hero.webp)' }}>
        <Container>
          <span className="eyebrow" style={{ color: '#fdba74' }}>Event equipment rental</span>
          <h1 className="mb-3">Everything your event needs, delivered and set up.</h1>
          <p className="lead mb-4">
            Rent sound, lighting, staging, furniture and tents for weddings, concerts, college fests and corporate events.
          </p>

          <Form className="hero-search" onSubmit={handleSearch} aria-label="Find equipment">
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <Form.Group controlId="hero-q">
                  <Form.Label>What do you need?</Form.Label>
                  <Form.Control value={search.q} onChange={(e) => setSearch({ ...search, q: e.target.value })} placeholder="Speakers, chairs, tents…" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="hero-category">
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })}>
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} md={2}>
                <Form.Group controlId="hero-start">
                  <Form.Label>Event from</Form.Label>
                  <Form.Control type="date" min={todayInput()} value={search.start} onChange={(e) => setSearch({ ...search, start: e.target.value, end: search.end && search.end < e.target.value ? e.target.value : search.end })} />
                </Form.Group>
              </Col>
              <Col xs={6} md={2}>
                <Form.Group controlId="hero-end">
                  <Form.Label>To</Form.Label>
                  <Form.Control type="date" min={search.start || todayInput()} value={search.end} onChange={(e) => setSearch({ ...search, end: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={1} className="d-grid">
                <Button type="submit" aria-label="Search equipment"><Search /></Button>
              </Col>
            </Row>
          </Form>
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
              <Link key={c.name} to={`/catalog?category=${encodeURIComponent(c.name)}`} className="category-tile">
                <img src={CATEGORY_IMAGES[c.name]} alt="" loading="lazy" />
                <span className="label"><strong>{c.name}</strong><span>{c.count} item{c.count === 1 ? '' : 's'}</span></span>
              </Link>
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
                  <div className="cover"><img src={kit.image} alt="" loading="lazy" /></div>
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
            <div className="cta-band" style={{ backgroundImage: 'url(/images/banners/weddings.webp)' }}>
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

import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconArrowUpRight, IconBolt, IconCheck, IconClipboardList, IconPackages, IconReceiptOff,
  IconShieldCheck, IconTruckDelivery, IconUsersGroup,
} from '@tabler/icons-react';
import usePageTitle from '../hooks/usePageTitle';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useAddToRequest from '../hooks/useAddToRequest';
import { categoryStyle, PACKAGES } from '../data/storefront';
import { formatCurrency, todayInput } from '../utils/format';
import ProductCard from '../components/store/ProductCard';
import EquipmentImage from '../components/EquipmentImage';

const SMALL_FEATURES = [
  { icon: IconShieldCheck, title: 'Tested before every event', text: 'Every item is checked before dispatch.' },
  { icon: IconReceiptOff, title: 'No payment up front', text: 'We confirm your request before you pay.' },
  { icon: IconPackages, title: 'Ready-made kits', text: 'Wedding, concert, corporate and fest bundles.' },
  { icon: IconClipboardList, title: 'Track every request', text: 'From pending to approved to returned.' },
  { icon: IconUsersGroup, title: 'Crew on site', text: 'Setup, operation and pickup by our team.' },
  { icon: IconBolt, title: 'Power covered', text: 'Generators and distribution for outdoor shows.' },
];

const COMPARE = [
  ['Upfront cost', 'Buy everything, often lakhs.', 'Deposit plus advance payment.', 'Pay per day, only after approval.'],
  ['Availability', 'Whatever you own.', 'Call around and wait for quotes.', 'Live stock for your exact dates.'],
  ['Delivery & setup', 'Hire transport and crew yourself.', 'Usually extra, booked separately.', 'Included — delivered, set up, picked up.'],
  ['Maintenance', 'Repairs and testing are on you.', 'Varies by shop.', 'Every item tested before dispatch.'],
  ['Storage', 'Space for gear all year.', 'None.', 'None.'],
  ['Changes', 'Not applicable.', 'Phone calls and emails.', 'Cancel free while the request is pending.'],
];

export default function Landing() {
  usePageTitle(null);
  const { isAdmin } = useAuth();
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
      {/* ---- Hero on the grid canvas ---- */}
      <section className="studio-hero grid-canvas hero">
        <Container>
          <span className="badge-dark-pill mb-4">
            <span className="dot-icon"><span className="live-dot" /></span>
            Live availability for your event dates
          </span>
          <h1 className="display-xxl mt-4 mb-4">
            Event gear,
            <br />
            <span className="accent">delivered &amp; set up.</span>
          </h1>
          <p className="lead-strong">Rent everything your event needs in minutes.</p>
          <p className="lead-muted">
            Sound, lighting, staging, furniture and tents for weddings, concerts, college fests and corporate events.
          </p>

          <Form className="prompt-search hero-search" onSubmit={handleSearch} aria-label="Find equipment">
            <Form.Control
              id="hero-q"
              className="main-input"
              value={search.q}
              onChange={(e) => setSearch({ ...search, q: e.target.value })}
              placeholder="What does your event need? Speakers, chairs, a tent…"
              aria-label="What do you need?"
            />
            <div className="options">
              <Form.Group controlId="hero-category" className="flex-grow-1" style={{ minWidth: 170 }}>
                <Form.Label>Category</Form.Label>
                <Form.Select value={search.category} onChange={(e) => setSearch({ ...search, category: e.target.value })}>
                  <option value="">All categories</option>
                  {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="hero-start" style={{ minWidth: 150 }}>
                <Form.Label>Event from</Form.Label>
                <Form.Control type="date" min={todayInput()} value={search.start} onChange={(e) => setSearch({ ...search, start: e.target.value, end: search.end && search.end < e.target.value ? e.target.value : search.end })} />
              </Form.Group>
              <Form.Group controlId="hero-end" style={{ minWidth: 150 }}>
                <Form.Label>To</Form.Label>
                <Form.Control type="date" min={search.start || todayInput()} value={search.end} onChange={(e) => setSearch({ ...search, end: e.target.value })} />
              </Form.Group>
              <Button type="submit" className="ms-auto">
                Find equipment<IconArrowUpRight size={18} className="arrow" />
              </Button>
            </div>
          </Form>
          <div className="stat-row">
            <span><strong>{allItems.length || 24}+</strong> items in stock</span>
            <span><strong>8</strong> categories</span>
            <span><strong>4</strong> ready-made kits</span>
          </div>
        </Container>

        {/* Floating product cards over the blue band */}
        <div className="float-band" aria-hidden="true">
          <div className="float-row">
            {popular.slice(0, 6).map((item) => (
              <div key={item._id} className="float-card">
                <div className="visual"><EquipmentImage item={item} /></div>
                <div className="meta text-start">
                  <div className="fw-semibold text-truncate" style={{ color: 'var(--ink)' }}>{item.name}</div>
                  <div className="text-muted">{formatCurrency(item.dailyRate)} / day</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="section">
        <Container>
          <h2 className="section-title mb-5">Oh, and everything else is handled too.</h2>
          <Row className="g-3 mb-3">
            <Col lg={5}>
              <div className="bezel">
                <div className="bezel-inner d-flex flex-column">
                  <h3 className="h3 mb-1" style={{ fontSize: 26, fontWeight: 500 }}>Delivered, set up, picked up.</h3>
                  <p className="text-muted">Our crew handles transport, installation and collection across Coimbatore.</p>
                  <div className="mt-auto d-flex align-items-center gap-3 p-3 rounded-4" style={{ background: '#fff' }}>
                    <span className="feature-tile"><span className="ficon"><IconTruckDelivery size={20} /></span></span>
                    <div>
                      <div className="fw-semibold" style={{ color: 'var(--ink)' }}>Out for delivery</div>
                      <div className="small text-muted">Crew arriving at 7:30 AM · Main Auditorium</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={7}>
              <div className="bezel">
                <div className="bezel-inner">
                  <h3 className="h3 mb-1" style={{ fontSize: 26, fontWeight: 500 }}>See what’s free for your exact dates.</h3>
                  <p className="text-muted">Pick dates once — every product shows live stock, and your request totals update as you go.</p>
                  <div className="d-grid gap-2 mt-3">
                    {popular.slice(0, 3).map((item, i) => (
                      <div key={item._id} className="d-flex align-items-center gap-3 p-2 pe-3 rounded-4" style={{ background: '#fff' }}>
                        <span className="top-thumb"><EquipmentImage item={item} size="thumb" /></span>
                        <span className="flex-grow-1 text-truncate fw-semibold" style={{ color: 'var(--ink)' }}>{item.name}</span>
                        <span className={`avail ${i === 2 ? 'avail-low' : 'avail-ok'}`}>{i === 2 ? 'Only 4 left' : 'Available'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row xs={1} sm={2} lg={3} xl={6} className="g-3">
            {SMALL_FEATURES.map(({ icon: Icon, title, text }) => (
              <Col key={title}>
                <div className="bezel bezel-sm feature-tile">
                  <div className="bezel-inner">
                    <span className="ficon"><Icon size={18} /></span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ---- Categories ---- */}
      <section className="section">
        <Container>
          <div className="section-head">
            <h2 className="section-title mb-0">Shop by category</h2>
            <Link to="/catalog" className="btn btn-outline-secondary">All equipment<IconArrowUpRight size={16} className="arrow" /></Link>
          </div>
          <div className="category-grid">
            {categories.map((c) => <CategoryTile key={c.name} category={c} />)}
          </div>
        </Container>
      </section>

      {/* ---- Popular ---- */}
      <section className="section">
        <Container>
          <div className="section-head">
            <h2 className="section-title mb-0">Most rented <span className="heading-accent">right now.</span></h2>
            <Link to="/catalog?sort=popular" className="btn btn-outline-secondary">See more<IconArrowUpRight size={16} className="arrow" /></Link>
          </div>
          <div className="product-grid">
            {popular.map((item) => <ProductCard key={item._id} item={item} />)}
          </div>
        </Container>
      </section>

      {/* ---- Kits on the navy band ---- */}
      <section className="navy-band" id="packages">
        <Container>
          <span className="eyebrow text-uppercase">Ready-made kits</span>
          <h2 className="section-title mt-2 mb-2">One click, a whole event.</h2>
          <p className="text-muted mb-5">Start from a kit, then adjust quantities on your request.</p>
          <Row xs={1} md={2} xl={4} className="g-3">
            {kits.map((kit) => (
              <Col key={kit.id}>
                <article className="package-card">
                  <div className="cover kit-cover" aria-hidden="true">
                    {kit.icons.map((Icon, i) => <span key={i} className="kit-icon"><Icon size={22} /></span>)}
                  </div>
                  <div className="body">
                    <h3 className="mb-1" style={{ fontWeight: 600 }}>{kit.name}</h3>
                    <p className="text-muted small mb-0" style={{ color: 'var(--muted)' }}>{kit.blurb}</p>
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

      {/* ---- Comparison ---- */}
      <section className="section">
        <Container>
          <h2 className="section-title mb-4">
            Your next event.
            <br />
            <span className="heading-accent">Less to manage.</span>
          </h2>
          <div className="compare">
            <table>
              <thead>
                <tr>
                  <th><small>From idea to event day</small></th>
                  <th>Buying your own<small>You own and run everything</small></th>
                  <th>Other rental shops<small>Phone, quotes, deposits</small></th>
                  <th className="hl">RentKit<small>One request, we handle the rest</small></th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, own, other, us]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{own}</td>
                    <td>{other}</td>
                    <td className="hl"><span className="tick"><IconCheck size={13} stroke={3} /></span>{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-end mt-4">
            <Link to="/catalog" className="btn btn-primary btn-lg">Start your request<IconArrowUpRight size={18} className="arrow" /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}

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

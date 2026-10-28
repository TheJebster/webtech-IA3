import { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconArrowDown, IconArrowUpRight, IconBolt, IconCheck, IconClipboardList, IconReceiptOff,
  IconShieldCheck, IconTruckDelivery, IconUsersGroup,
} from '@tabler/icons-react';
import usePageTitle from '../hooks/usePageTitle';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { categoryStyle } from '../data/storefront';
import { formatCurrency, todayInput } from '../utils/format';
import ProductCard from '../components/store/ProductCard';
import EquipmentImage from '../components/EquipmentImage';
import DateInput from '../components/DateInput';
import SplitText from '../motion/SplitText';
import { gsap, reducedMotion, ScrollTrigger } from '../motion/engine';

const SMALL_FEATURES = [
  { icon: IconShieldCheck, title: 'Tested before every event', text: 'Every item is checked before dispatch.' },
  { icon: IconReceiptOff, title: 'No payment up front', text: 'We confirm your request before you pay.' },
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
  const { dates, setDates } = useCart();
  const navigate = useNavigate();

  const [search, setSearch] = useState({ q: '', category: '', start: dates.start, end: dates.end });
  const [categories, setCategories] = useState([]);
  const [popular, setPopular] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    api.get('/equipment/meta').then(({ data }) => setCategories(data.categories)).catch(() => {});
    api.get('/equipment', { params: { sort: 'popular', limit: 8 } }).then(({ data }) => setPopular(data.items)).catch(() => {});
    api.get('/equipment', { params: { limit: 100 } }).then(({ data }) => setAllItems(data.items)).catch(() => {});
  }, []);

  // Scroll-linked motion (floema.com): the hero headline drifts up and fades as you leave it,
  // and the floating product cards move at different speeds through the band
  useEffect(() => {
    if (reducedMotion() || !heroRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-copy', { yPercent: 0, opacity: 1 }, {
        yPercent: -18,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom 30%', scrub: true },
      });
      gsap.utils.toArray('.float-slot').forEach((slot, i) => {
        gsap.fromTo(slot, { y: 60 + (i % 3) * 40 }, {
          y: -40 - (i % 3) * 30,
          ease: 'none',
          scrollTrigger: { trigger: '.float-band', start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, heroRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [popular.length]);

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
      <section className="studio-hero grid-canvas hero" ref={heroRef}>
        <Container>
          <div className="hero-copy">
            <SplitText as="h1" className="display-xxl mb-4">
              Event gear,
              <br />
              <span className="accent">delivered &amp; set up.</span>
            </SplitText>
            <p className="lead-strong">Rent everything your event needs in minutes.</p>
            <p className="lead-muted">
              Sound, lighting, staging, furniture and tents for weddings, concerts, college fests and corporate events.
            </p>
          </div>

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
                <DateInput id="hero-start" min={todayInput()} value={search.start} onChange={(v) => setSearch({ ...search, start: v, end: search.end && search.end < v ? v : search.end })} />
              </Form.Group>
              <Form.Group controlId="hero-end" style={{ minWidth: 150 }}>
                <Form.Label>To</Form.Label>
                <DateInput id="hero-end" min={search.start || todayInput()} value={search.end} onChange={(v) => setSearch({ ...search, end: v })} />
              </Form.Group>
              <Button type="submit" className="ms-auto">
                Find equipment<IconArrowUpRight size={18} className="arrow" />
              </Button>
            </div>
          </Form>
          <div className="stat-row">
            <span><strong>{allItems.length || 24}+</strong> items in stock</span>
            <span><strong>8</strong> categories</span>
          </div>
          <span className="scroll-cue" aria-hidden="true">Scroll to explore <IconArrowDown size={14} /></span>
        </Container>

        {/* Floating product cards over the blue band */}
        <div className="float-band" aria-hidden="true">
          <div className="float-row">
            {popular.slice(0, 6).map((item) => (
              <div key={item._id} className="float-slot">
                <div className="float-card">
                  <div className="visual"><EquipmentImage item={item} /></div>
                  <div className="meta text-start">
                    <div className="fw-semibold text-truncate" style={{ color: 'var(--ink)' }}>{item.name}</div>
                    <div className="text-muted">{formatCurrency(item.dailyRate)} / day</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="section">
        <Container>
          <SplitText as="h2" className="section-title mb-5">Oh, and everything else is handled too.</SplitText>
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
          <Row xs={1} sm={2} lg={3} xl={5} className="g-3">
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
            <SplitText as="h2" className="section-title mb-0">Shop by category</SplitText>
            <Link to="/catalog" className="btn btn-outline-secondary">All equipment<IconArrowUpRight size={16} className="arrow" /></Link>
          </div>
          <div className="collections">
            {categories.map((c, i) => <CategoryTile key={c.name} category={c} index={i} />)}
          </div>
        </Container>
      </section>

      {/* ---- Popular ---- */}
      <section className="section">
        <Container>
          <div className="section-head">
            <SplitText as="h2" className="section-title mb-0">Most rented <span className="heading-accent">right now.</span></SplitText>
            <Link to="/catalog?sort=popular" className="btn btn-outline-secondary">See more<IconArrowUpRight size={16} className="arrow" /></Link>
          </div>
          <div className="product-grid">
            {popular.map((item) => <ProductCard key={item._id} item={item} />)}
          </div>
        </Container>
      </section>

      {/* ---- Comparison ---- */}
      <section className="section">
        <Container>
          <SplitText as="h2" className="section-title mb-4">
            Your next event.
            <br />
            <span className="heading-accent">Less to manage.</span>
          </SplitText>
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

// Floema-style collection row: big name with the item count in brackets; on hover the row
// tints, the icon slides in and the arrow turns
function CategoryTile({ category, index }) {
  const { icon: Icon } = categoryStyle(category.name);
  return (
    <Link to={`/catalog?category=${encodeURIComponent(category.name)}`} className="collection-row">
      <span className="collection-no">{String(index + 1).padStart(2, '0')}</span>
      <span className="collection-icon" aria-hidden="true"><Icon size={26} stroke={1.6} /></span>
      <span className="collection-name">
        {category.name}
        <sup>({category.count})</sup>
      </span>
      <span className="collection-arrow" aria-hidden="true"><IconArrowUpRight size={22} /></span>
    </Link>
  );
}

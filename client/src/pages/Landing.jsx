import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, ClipboardCheck, GraphUp, PeopleFill, Search, ShieldLock, BoxSeam, Tools,
} from 'react-bootstrap-icons';
import usePageTitle from '../hooks/usePageTitle';
import { homePathFor, useAuth } from '../context/AuthContext';
import ProductPreview from '../components/ProductPreview';

const STEPS = [
  { icon: Search, accent: '', title: 'Browse the catalog', text: 'Search and filter sound, lighting, staging, furniture and more — with live daily rates.' },
  { icon: CalendarCheck, accent: 'blue', title: 'Request your dates', text: 'Pick your event dates and quantities. Availability and cost are calculated instantly.' },
  { icon: ClipboardCheck, accent: 'peach', title: 'Get it approved', text: 'Our team reviews and approves your request. Track every status from your rentals page.' },
];

const ADMIN_CAPS = [
  { icon: GraphUp, text: 'Dashboard with inventory, user and rental statistics plus recent activity' },
  { icon: Tools, text: 'One operations page to view, add, update and delete equipment' },
  { icon: ClipboardCheck, text: 'Approve, reject and close rental requests' },
  { icon: PeopleFill, text: 'Manage users — add, edit details, change roles, deactivate or remove' },
];

const USER_CAPS = [
  { icon: Search, text: 'Browse and search the full equipment catalog' },
  { icon: BoxSeam, text: 'See detailed specs, rates and availability for every item' },
  { icon: CalendarCheck, text: 'Request rentals for an event and track their status' },
  { icon: ShieldLock, text: 'Secure account with password change at any time' },
];

// Yellow + black pill pair used at every conversion moment
function ButtonPair({ user }) {
  if (user) {
    const isAdmin = user.role === 'admin';
    return (
      <div className="d-flex flex-wrap justify-content-center gap-3">
        <Link to={homePathFor(user)} className="btn btn-primary btn-lg">Go to {isAdmin ? 'dashboard' : 'catalog'}</Link>
        <Link to={isAdmin ? '/admin/operations' : '/my-rentals'} className="btn btn-dark btn-lg">{isAdmin ? 'Operations' : 'My rentals'}</Link>
      </div>
    );
  }
  return (
    <div className="d-flex flex-wrap justify-content-center gap-3">
      <Link to="/signup" className="btn btn-primary btn-lg">Create an account</Link>
      <Link to="/login" className="btn btn-dark btn-lg">Log in</Link>
    </div>
  );
}

export default function Landing() {
  usePageTitle(null);
  const { user } = useAuth();

  return (
    <>
      <section className="hero-section text-center">
        <Container>
          <span className="hero-eyebrow mb-4"><span className="dot" />Event Equipment Rental System</span>
          <h1 className="display-heading mb-4 mx-auto" style={{ maxWidth: 900 }}>
            Rent the <span className="sticker" aria-hidden="true">🔊</span>sound,
            the <span className="sticker sticker-alt" aria-hidden="true">💡</span>lights and
            the <span className="sticker" aria-hidden="true">🎪</span>stage for your next event
          </h1>
          <p className="hero-lead text-muted mb-4">
            RentKit lets you rent professional equipment for weddings, concerts, college fests and corporate
            events — and gives our team the tools to manage it all.
          </p>
          <ButtonPair user={user} />
        </Container>
        <Container className="mt-5">
          <ProductPreview />
        </Container>
      </section>

      <section className="section">
        <Container>
          <h2 className="heading-lg text-center mb-3">
            From idea to <span className="sticker" aria-hidden="true">🎉</span>equipped event
          </h2>
          <p className="text-muted text-center mb-5">Three steps. No phone calls, no spreadsheets.</p>
          <Row xs={1} md={3} className="g-4">
            {STEPS.map(({ icon: Icon, accent, title, text }, i) => (
              <Col key={title}>
                <div className="feature-card">
                  <div className={`icon-circle ${accent} mb-4`}><Icon size={22} /></div>
                  <div className="small fw-semibold mb-1">Step {i + 1}</div>
                  <h3 className="h4 mb-2">{title}</h3>
                  <p className="text-muted mb-0">{text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section">
        <Container>
          <h2 className="heading-lg text-center mb-3">
            Built for <span className="sticker" aria-hidden="true">🧑‍💼</span>admins and <span className="sticker sticker-alt" aria-hidden="true">🙋</span>customers
          </h2>
          <p className="text-muted text-center mb-5">Role-based access keeps every user to exactly what they need.</p>
          <Row xs={1} md={2} className="g-4">
            {[
              { title: 'Administrators', caps: ADMIN_CAPS, highlight: true },
              { title: 'Customers', caps: USER_CAPS, highlight: false },
            ].map(({ title, caps, highlight }) => (
              <Col key={title}>
                <div className={`feature-card ${highlight ? 'highlight' : ''}`}>
                  <h3 className="h3 mb-4">{title}</h3>
                  <ul className="list-unstyled mb-0 d-grid gap-3">
                    {caps.map(({ icon: CapIcon, text }) => (
                      <li key={text} className="d-flex gap-3 align-items-start">
                        <span className={`icon-circle ${highlight ? 'black' : ''} flex-shrink-0`} style={{ width: 34, height: 34, borderRadius: 11 }}>
                          <CapIcon size={15} />
                        </span>
                        <span className="pt-1">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="section text-center">
        <Container>
          <div className="feature-card py-5">
            <h2 className="heading-lg mb-3">
              Ready to light up your <span className="sticker" aria-hidden="true">🎤</span>next event?
            </h2>
            <p className="text-muted mb-4">Create a free account and send your first rental request in minutes.</p>
            <ButtonPair user={user} />
          </div>
        </Container>
      </section>
    </>
  );
}

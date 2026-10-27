import { Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Boombox, CalendarCheck, Camera2, Lightbulb, Lightning, ShieldLock, Search, Easel, Tools, PeopleFill,
  ClipboardCheck, GraphUp, PersonBadge, Umbrella, BoxSeam,
} from 'react-bootstrap-icons';
import { homePathFor, useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { icon: Boombox, label: 'Audio' },
  { icon: Lightbulb, label: 'Lighting' },
  { icon: Easel, label: 'Staging' },
  { icon: Umbrella, label: 'Tents & Canopies' },
  { icon: Camera2, label: 'Video & Projection' },
  { icon: Lightning, label: 'Power' },
];

const STEPS = [
  { icon: Search, title: 'Browse the catalog', text: 'Search and filter sound, lighting, staging, furniture and more — with live daily rates.' },
  { icon: CalendarCheck, title: 'Request for your dates', text: 'Pick your event dates and quantities. We check availability and calculate the cost instantly.' },
  { icon: ClipboardCheck, title: 'Get it approved', text: 'Our team reviews and approves your request. Track every status from your rentals page.' },
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

export default function Landing() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero text-white">
        <Container className="py-5">
          <Row className="align-items-center g-5 py-lg-4">
            <Col lg={7}>
              <span className="badge rounded-pill hero-badge mb-3">Event Equipment Rental System</span>
              <h1 className="display-5 fw-bold mb-3">Everything your event needs, ready when you are.</h1>
              <p className="lead opacity-75 mb-4">
                RentKit lets you rent professional sound, lighting, staging and furniture for weddings,
                concerts, college fests and corporate events — and gives our team the tools to manage it all.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {user ? (
                  <Link to={homePathFor(user)} className="btn btn-light btn-lg fw-semibold">
                    Go to {user.role === 'admin' ? 'dashboard' : 'catalog'}
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-light btn-lg fw-semibold">Create an account</Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg">Log in</Link>
                  </>
                )}
              </div>
            </Col>
            <Col lg={5}>
              <Row xs={2} sm={3} className="g-3">
                {CATEGORIES.map(({ icon: Icon, label }) => (
                  <Col key={label}>
                    <div className="hero-tile text-center p-3 h-100">
                      <Icon size={28} className="mb-2" />
                      <div className="small fw-semibold">{label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <h2 className="h3 fw-bold text-center mb-2">How it works</h2>
        <p className="text-muted text-center mb-4">Three steps from idea to an equipped event.</p>
        <Row xs={1} md={3} className="g-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Col key={title}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="icon-circle mb-3"><Icon size={22} /></div>
                  <div className="small text-primary fw-semibold mb-1">Step {i + 1}</div>
                  <Card.Title className="fw-bold">{title}</Card.Title>
                  <Card.Text className="text-muted">{text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="pb-5">
        <h2 className="h3 fw-bold text-center mb-2">Built for two roles</h2>
        <p className="text-muted text-center mb-4">Role-based access keeps every user to exactly what they need.</p>
        <Row xs={1} md={2} className="g-4">
          {[
            { title: 'Administrators', icon: PersonBadge, caps: ADMIN_CAPS, accent: 'primary' },
            { title: 'Customers', icon: PeopleFill, caps: USER_CAPS, accent: 'success' },
          ].map(({ title, icon: Icon, caps, accent }) => (
            <Col key={title}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Icon size={22} className={`text-${accent}`} />
                    <h3 className="h5 fw-bold mb-0">{title}</h3>
                  </div>
                  <ul className="list-unstyled mb-0">
                    {caps.map(({ icon: CapIcon, text }) => (
                      <li key={text} className="d-flex gap-2 mb-2">
                        <CapIcon className={`text-${accent} flex-shrink-0 mt-1`} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

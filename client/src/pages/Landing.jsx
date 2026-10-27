import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { homePathFor, useAuth } from '../context/AuthContext';

const ADMIN_CAPS = [
  'Dashboard with inventory, users, revenue and recent activity',
  'One operations page to view, add, update, hide and delete equipment',
  'Approve, reject, return or cancel rental requests',
  'Add users, edit details and roles, deactivate or remove them',
];

const CUSTOMER_STEPS = [
  'Browse and search the catalog of sound, lighting, staging and furniture',
  'Add equipment to a request and pick your event dates',
  'See live availability and the total cost before you submit',
  'Follow the request from pending to approved on My rentals',
];

const STACK = [
  ['MongoDB', 'database'],
  ['Express', 'REST API'],
  ['React', 'interface'],
  ['Node.js', 'runtime'],
];

function Screenshot({ src, alt }) {
  return (
    <div className="shot-frame">
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

export default function Landing() {
  usePageTitle(null);
  const { user } = useAuth();

  return (
    <>
      <section className="hero">
        <Container>
          <div className="hero-row">
            <div>
              <h1 className="display-hero">Event equipment rental, built for precision.</h1>
              <p className="lead-muted mt-4 mb-0" style={{ maxWidth: 560 }}>
                RentKit lets you rent sound, lighting, staging and furniture for weddings, concerts, college fests and
                corporate events — and gives our team one place to manage it all.
              </p>
            </div>
            <div className="action-row">
              {user ? (
                <Link to={homePathFor(user)} className="btn btn-primary">
                  {user.role === 'admin' ? 'Open dashboard' : 'Browse equipment'}
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary">Create an account</Link>
                  <Link to="/login" className="link-arrow">Log in</Link>
                </>
              )}
            </div>
          </div>
        </Container>
        <div className="hero-floor">
          <Container>
            <Screenshot src="/showcase/catalog.png" alt="The RentKit equipment catalog" />
          </Container>
        </div>
      </section>

      <section>
        <Container>
          <div className="stack-strip" aria-label="Built with">
            {STACK.map(([name, role]) => (
              <span key={name}><strong>{name}</strong> {role}</span>
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={5}>
              <h2 className="section-heading mb-4">For customers</h2>
              <p className="lead-muted mb-4">From an idea to an equipped event in a few minutes.</p>
              <ul className="feature-list">
                {CUSTOMER_STEPS.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </Col>
            <Col lg={7}>
              <Screenshot src="/showcase/request.png" alt="A rental request with live availability and pricing" />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Row className="g-5 align-items-center flex-lg-row-reverse">
            <Col lg={5}>
              <h2 className="section-heading mb-4">For administrators</h2>
              <p className="lead-muted mb-4">Role-based access gives the team the tools — and only the team.</p>
              <ul className="feature-list">
                {ADMIN_CAPS.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </Col>
            <Col lg={7}>
              <Screenshot src="/showcase/dashboard.png" alt="The RentKit admin dashboard" />
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
}

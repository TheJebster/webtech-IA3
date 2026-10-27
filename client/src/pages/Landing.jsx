import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { homePathFor, useAuth } from '../context/AuthContext';

const STEPS = [
  { title: 'Browse the catalog', text: 'Search sound, lighting, staging, furniture and more, with daily rates.' },
  { title: 'Request your dates', text: 'Choose dates and quantities. Availability and cost are calculated instantly.' },
  { title: 'Get it approved', text: 'Our team reviews the request. Follow its status from your rentals page.' },
];

const ROLES = [
  {
    title: 'Administrators',
    caps: [
      'A dashboard of inventory, users, rentals and recent activity',
      'One operations page to view, add, update and delete equipment',
      'Approve, reject and close rental requests',
      'Add users, edit details and roles, deactivate or remove them',
    ],
  },
  {
    title: 'Customers',
    caps: [
      'Browse and search the full equipment catalog',
      'Read the details, rate and features of every item',
      'Request rentals for an event and follow their status',
      'Change their password at any time',
    ],
  },
];

export default function Landing() {
  usePageTitle(null);
  const { user } = useAuth();

  return (
    <>
      <section>
        <Container>
          <div className="intro">
            <h1 className="display-xl mb-0">Event equipment, rented simply.</h1>
            <p>
              Sound, lighting, staging and furniture for weddings, concerts, college fests and corporate events —
              requested online and approved by our team.
            </p>
            <div className="action-row mt-4">
              {user ? (
                <Link to={homePathFor(user)} className="btn btn-primary">
                  {user.role === 'admin' ? 'Open the dashboard' : 'Browse equipment'}
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary">Create an account</Link>
                  <Link to="/login" className="btn btn-outline-secondary">Log in</Link>
                </>
              )}
            </div>
          </div>

          {/* Project row: the product itself, shown in device frames */}
          <div className="project-row section" aria-hidden="true">
            <div className="device-laptop">
              <div className="screen"><img src="/showcase/desktop.png" alt="" loading="lazy" /></div>
              <div className="base" />
            </div>
            <div className="device-phone">
              <img src="/showcase/mobile.png" alt="" loading="lazy" />
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <h2 className="mb-5">How it works</h2>
          <div className="step-list">
            {STEPS.map(({ title, text }, i) => (
              <div key={title}>
                <span className="step-no">{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <h2 className="mb-5">Two roles</h2>
          <Row xs={1} md={2} className="g-5">
            {ROLES.map(({ title, caps }) => (
              <Col key={title}>
                <h3 className="mb-3">{title}</h3>
                <ul className="plain-list text-muted">
                  {caps.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
}

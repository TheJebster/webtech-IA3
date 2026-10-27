import { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import BrandMark from './BrandMark';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/operations', label: 'Operations' },
  { to: '/admin/users', label: 'Users' },
];

const USER_LINKS = [
  { to: '/catalog', label: 'Equipment' },
  { to: '/rental-request', label: 'Request' },
  { to: '/my-rentals', label: 'My rentals' },
];

// Fixed top bar: logo left, text links, account actions right
export default function AppNavbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const notify = useToast();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const close = () => setExpanded(false);

  const handleLogout = () => {
    close();
    logout();
    notify('You have been logged out.');
    navigate('/login');
  };

  const links = user ? (isAdmin ? ADMIN_LINKS : USER_LINKS) : [];

  return (
    <header className="site-header">
      <Navbar expand="md" expanded={expanded} onToggle={setExpanded} variant="dark">
        <Container>
          <Link to="/" className="brand me-4" onClick={close}>
            <BrandMark />
            RentKit
          </Link>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav" className="site-nav">
            <Nav className="me-auto">
              {links.map((link) => (
                <Nav.Link key={link.to} as={NavLink} to={link.to} end={link.end} onClick={close}>
                  {link.label}
                  {link.to === '/rental-request' && count > 0 && <span className="count-pill" aria-label={`${count} items`}>{count}</span>}
                </Nav.Link>
              ))}
            </Nav>
            <Nav className="align-items-md-center gap-md-1 py-2 py-md-0">
              {user ? (
                <>
                  <span className="nav-user px-md-2 py-1">{user.name} · {user.role}</span>
                  <Nav.Link as={NavLink} to="/account/password" onClick={close}>Password</Nav.Link>
                  <button type="button" className="btn btn-outline-secondary btn-sm ms-md-2 align-self-start align-self-md-center" onClick={handleLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Nav.Link as={NavLink} to="/login" onClick={close}>Log in</Nav.Link>
                  <Link to="/signup" className="btn btn-light btn-sm ms-md-2 align-self-start align-self-md-center" onClick={close}>Sign up</Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

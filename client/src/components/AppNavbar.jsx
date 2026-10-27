import { useState } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BoxSeam, Cart3, PersonCircle } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/operations', label: 'Operations' },
  { to: '/admin/users', label: 'Users' },
];

const USER_LINKS = [
  { to: '/catalog', label: 'Browse Equipment' },
  { to: '/my-rentals', label: 'My Rentals' },
];

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
    notify('You have been logged out.', 'secondary');
    navigate('/login');
  };

  const links = user ? (isAdmin ? ADMIN_LINKS : USER_LINKS) : [];

  return (
    <div className="nav-shell">
    <Navbar expand="md" className="nav-card" expanded={expanded} onToggle={setExpanded}>
      <Container fluid className="px-0">
        <Navbar.Brand as={Link} to="/" onClick={close} className="fw-bold d-flex align-items-center gap-2">
          <span className="brand-mark"><BoxSeam /></span>
          RentKit
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {links.map((link) => (
              <Nav.Link key={link.to} as={NavLink} to={link.to} end={link.end} onClick={close}>
                {link.label}
              </Nav.Link>
            ))}
          </Nav>
          <Nav className="align-items-md-center">
            {user && !isAdmin && (
              <Nav.Link as={NavLink} to="/rental-request" onClick={close} className="d-flex align-items-center gap-1 me-md-2" aria-label={`Rental request, ${count} items`}>
                <Cart3 size={18} />
                <span className="d-md-none d-lg-inline">Request</span>
                {count > 0 && <span className="badge rounded-pill text-bg-primary">{count}</span>}
              </Nav.Link>
            )}
            {user ? (
              <NavDropdown
                align="end"
                title={
                  <span className="d-inline-flex align-items-center gap-2">
                    <PersonCircle size={20} />
                    <span>{user.name}</span>
                    <span className={`badge ${isAdmin ? 'text-bg-primary' : 'bg-light'}`}>
                      {user.role}
                    </span>
                  </span>
                }
                id="account-menu"
              >
                <NavDropdown.ItemText className="small text-muted">{user.email}</NavDropdown.ItemText>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/account/password" onClick={close}>
                  Change password
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  Log out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex gap-2 py-2 py-md-0">
                <Link to="/login" onClick={close} className="btn btn-outline-dark">Log in</Link>
                <Link to="/signup" onClick={close} className="btn btn-dark">Sign up</Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
}

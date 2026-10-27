import { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Cart3, Envelope, Search, Telephone, Truck } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { CONTACT } from '../data/storefront';
import BrandMark from './BrandMark';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/operations', label: 'Operations' },
  { to: '/admin/users', label: 'Users' },
  { to: '/catalog', label: 'View store' },
];

const SHOP_LINKS = [
  { to: '/catalog', label: 'Equipment' },
  { to: '/#packages', label: 'Packages', plain: true },
];

export default function AppNavbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const notify = useToast();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const close = () => setExpanded(false);

  const handleLogout = () => {
    close();
    logout();
    notify('You have been logged out.', 'secondary');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    close();
    navigate(`/catalog${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  const links = isAdmin ? ADMIN_LINKS : [...SHOP_LINKS, ...(user ? [{ to: '/my-rentals', label: 'My rentals' }] : [])];

  return (
    <>
      <div className="topbar d-none d-md-block">
        <div className="container">
          <span className="d-inline-flex align-items-center gap-2"><Truck /> Delivery, setup and pickup across {CONTACT.area}</span>
          <span className="d-inline-flex gap-3">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="d-inline-flex align-items-center gap-1"><Telephone /> {CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`} className="d-inline-flex align-items-center gap-1"><Envelope /> {CONTACT.email}</a>
          </span>
        </div>
      </div>
      <header className="site-header">
        <Navbar expand="lg" expanded={expanded} onToggle={setExpanded}>
          <Container>
            <Link to="/" className="brand me-3" onClick={close}>
              <BrandMark />
              RentKit
            </Link>
            <Navbar.Toggle aria-controls="main-nav" />
            <Navbar.Collapse id="main-nav" className="site-nav gap-lg-3">
              {!isAdmin && (
                <form className="header-search my-2 my-lg-0" role="search" onSubmit={handleSearch}>
                  <Search className="search-icon" aria-hidden="true" />
                  <input
                    className="form-control"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search speakers, lights, tents…"
                    aria-label="Search the catalog"
                  />
                </form>
              )}
              <Nav className="me-auto">
                {links.map((link) => (
                  <Nav.Link key={link.to} as={link.plain ? Link : NavLink} to={link.to} end={link.plain ? undefined : link.end} onClick={close}>
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
              <Nav className="align-items-lg-center gap-lg-1 pb-2 pb-lg-0">
                {user && !isAdmin && (
                  <Nav.Link as={NavLink} to="/rental-request" onClick={close} className="cart-link" aria-label={`Rental request, ${count} items`}>
                    <Cart3 size={18} /> Request
                    {count > 0 && <span className="count-pill">{count}</span>}
                  </Nav.Link>
                )}
                {user ? (
                  <>
                    <span className="nav-user px-lg-2 py-1">{user.name} · {user.role}</span>
                    <Nav.Link as={NavLink} to="/account/password" onClick={close}>Password</Nav.Link>
                    <button type="button" className="btn btn-sm btn-outline-secondary ms-lg-1 align-self-start align-self-lg-center" onClick={handleLogout}>
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={NavLink} to="/login" onClick={close}>Log in</Nav.Link>
                    <Link to="/signup" className="btn btn-primary btn-sm ms-lg-1 align-self-start align-self-lg-center" onClick={close}>Sign up</Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    </>
  );
}

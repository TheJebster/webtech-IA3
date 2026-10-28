import { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Cart3, Search } from 'react-bootstrap-icons';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
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
  const [hidden, setHidden] = useState(false);
  const close = () => setExpanded(false);

  // Floema-style header: slides away while scrolling down, comes back on the way up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 160);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes the phone/tablet menu
  useEffect(() => {
    if (!expanded) return undefined;
    const onKey = (e) => e.key === 'Escape' && setExpanded(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

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
      {/* Dims the page behind the open phone/tablet menu; tap to close */}
      {expanded && <div className="nav-backdrop d-lg-none" onClick={close} aria-hidden="true" />}
      <header className={`site-header ${hidden && !expanded ? 'is-hidden' : ''}`}>
        <Navbar expand="lg" expanded={expanded} onToggle={setExpanded} className="nav-floema">
          <Container fluid className="px-0">
            <Link to="/" className="brand me-3" onClick={close}>
              <BrandMark />
              RentKit
            </Link>
            <Navbar.Toggle aria-controls="main-nav" className="menu-toggle">
              <span className="menu-toggle-label">{expanded ? 'Close' : 'Menu'}</span>
              <span className={`menu-toggle-lines ${expanded ? 'open' : ''}`} aria-hidden="true"><span /><span /></span>
            </Navbar.Toggle>
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
              <Nav className="nav-chips me-auto">
                {links.map((link, i) => (
                  <Nav.Link key={link.to} as={link.plain ? Link : NavLink} to={link.to} end={link.plain ? undefined : link.end} onClick={close} style={{ '--i': i }}>
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
              <Nav className="nav-chips nav-account align-items-lg-center pb-2 pb-lg-0">
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
                    <button type="button" className="btn btn-sm btn-outline-secondary nav-logout align-self-start align-self-lg-center" onClick={handleLogout}>
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={NavLink} to="/login" onClick={close}>Log in</Nav.Link>
                    <Link to="/signup" className="btn btn-primary btn-sm nav-signup align-self-start align-self-lg-center" onClick={close}>Sign up<IconArrowUpRight size={16} className="arrow" /></Link>
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

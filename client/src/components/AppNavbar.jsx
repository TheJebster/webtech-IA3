import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

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

// Name and year on the left; a stacked, right-aligned list of text links on the right
export default function AppNavbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const notify = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    notify('You have been logged out.', 'secondary');
    navigate('/login');
  };

  const links = user ? (isAdmin ? ADMIN_LINKS : USER_LINKS) : [];

  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="site-name" aria-label="RentKit home">
          RentKit
          <br />
          {new Date().getFullYear()}
        </Link>
        <nav aria-label="Main">
          <ul className="site-nav">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end}>
                  {link.label}
                  {link.to === '/rental-request' && count > 0 && ` (${count})`}
                </NavLink>
              </li>
            ))}
            {user ? (
              <>
                <li className="nav-gap" aria-hidden="true" />
                <li className="nav-meta">{user.name} · {user.role}</li>
                <li><NavLink to="/account/password" className="nav-meta">Change password</NavLink></li>
                <li><button type="button" className="nav-meta" onClick={handleLogout}>Log out</button></li>
              </>
            ) : (
              <>
                <li><NavLink to="/login">Log in</NavLink></li>
                <li><NavLink to="/signup">Sign up</NavLink></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

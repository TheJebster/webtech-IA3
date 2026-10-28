import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import api from '../api/client';
import { CONTACT } from '../data/storefront';
import AppNavbar from './AppNavbar';
import BrandMark from './BrandMark';
import PageLoader from './PageLoader';
import { IconArrowUpRight } from '@tabler/icons-react';
import ScrollToTop from './ScrollToTop';
import MotionLayer from '../motion/MotionLayer';
import SplitText from '../motion/SplitText';

function SiteFooter() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get('/equipment/meta').then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-card">
        <div className="row g-4">
          <div className="col-lg-3">
            <Link to="/" className="brand mb-3"><BrandMark /> RentKit</Link>
            <p className="mb-0" style={{ maxWidth: 260, opacity: 0.9, fontSize: 14 }}>
              Sound, lighting, staging, furniture and tents — delivered, set up and picked up by our crew.
            </p>
          </div>
          <div className="col-lg-9">
            <div className="footer-cta">
              <SplitText className="big">Planning an event? Start your request.</SplitText>
              <Link to="/catalog" className="btn btn-dark">Browse equipment<IconArrowUpRight size={16} className="arrow" /></Link>
            </div>
            <div className="row g-4">
              <div className="col-6 col-md-4">
                <h3>Shop by category</h3>
                <ul>
                  {categories.map((c) => (
                    <li key={c.name}><Link to={`/catalog?category=${encodeURIComponent(c.name)}`}>{c.name}</Link></li>
                  ))}
                </ul>
              </div>
              <div className="col-6 col-md-4">
                <h3>Your account</h3>
                <ul>
                  <li><Link to="/my-rentals">My rentals</Link></li>
                  <li><Link to="/rental-request">Rental request</Link></li>
                  <li><Link to="/account/password">Change password</Link></li>
                  <li><Link to="/signup">Create an account</Link></li>
                </ul>
              </div>
              <div className="col-md-4">
                <h3>Contact</h3>
                <ul>
                  <li><a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a></li>
                  <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                  <li>Mon–Sat, 9 am – 8 pm · {CONTACT.area}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} RentKit — Event Equipment Rental · MongoDB, Express, React, Node.js</span>
        <span>Web Technology IA3 capstone</span>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <MotionLayer />
      <ScrollToTop />
      <AppNavbar />
      <main className="flex-grow-1">
        {/* Pages are lazy-loaded, so each route downloads only its own code */}
        <Suspense fallback={<div className="route-loading"><PageLoader /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

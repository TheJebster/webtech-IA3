import { CalendarCheck, CheckCircleFill, ShieldCheck, Truck } from 'react-bootstrap-icons';
import BrandMark from './BrandMark';

const POINTS = [
  { icon: Truck, text: 'Delivery, setup and pickup included' },
  { icon: CalendarCheck, text: 'Live availability for your dates' },
  { icon: ShieldCheck, text: 'No payment until we confirm' },
];

// Shared frame for Log in, Sign up and Change password: one bezel card with a coral
// side panel (matches the footer) and the form on the right. The panel stretches to the
// card's full height, so it never looks cut off; on phones it shrinks to a short header.
export default function AuthLayout({ title, subtitle, panelTitle, panelText, wide = false, children }) {
  return (
    <div className="container auth-shell">
      <div className={`auth-frame ${wide ? 'auth-frame-wide' : ''}`}>
        <aside className="auth-panel">
          <div className="auth-brand"><BrandMark /> RentKit</div>
          <div className="auth-panel-copy">
            <h2>{panelTitle}</h2>
            <p>{panelText}</p>
            <ul className="auth-points">
              {POINTS.map(({ icon: Icon, text }) => (
                <li key={text}><span className="icon"><Icon /></span>{text}</li>
              ))}
            </ul>
          </div>
          <div className="auth-note" aria-hidden="true">
            <CheckCircleFill className="text-success flex-shrink-0" />
            <div>
              <div className="fw-semibold">Request approved</div>
              <div className="small">Delivery at 8 AM on your event day</div>
            </div>
          </div>
        </aside>
        <section className="auth-form">
          <div className="auth-form-inner">
            <h1>{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

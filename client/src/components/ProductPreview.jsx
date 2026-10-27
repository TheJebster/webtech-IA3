import { ArrowRepeat, CalendarCheck, CheckLg, Search } from 'react-bootstrap-icons';
import { categoryMeta } from '../utils/categories';

const MOCK_ITEMS = [
  { name: 'Powered Speaker', category: 'Audio', rate: '₹2,500' },
  { name: 'Moving Head Beam', category: 'Lighting', rate: '₹1,500' },
  { name: 'Stage Deck 4×8', category: 'Staging', rate: '₹1,200' },
];

const FLOW = [
  { icon: Search, title: 'Browse', text: '24 items · 8 categories' },
  { icon: CalendarCheck, title: 'Request', text: '3 days · ₹68,400' },
  { icon: CheckLg, title: 'Approved', text: 'Delivery 8 AM' },
];

// Browser-style preview of RentKit itself — the product is the hero
export default function ProductPreview() {
  return (
    <div className="product-frame" aria-label="Preview of the RentKit app" role="img">
      <div className="product-frame-bar">
        <span className="traffic-dot" style={{ background: 'var(--color-annotation-red)' }} />
        <span className="traffic-dot" style={{ background: 'var(--color-highlighter-yellow)' }} />
        <span className="traffic-dot" style={{ background: 'var(--color-signal-blue)' }} />
        <span className="product-frame-url text-truncate">rentkit.app/catalog</span>
        <div className="avatar-stack ms-auto d-none d-sm-flex" aria-hidden="true">
          <span style={{ background: 'var(--color-highlighter-yellow)' }}>RS</span>
          <span style={{ background: 'var(--color-signal-blue)', color: '#fff' }}>AN</span>
          <span style={{ background: 'var(--color-peach-wash)' }}>AD</span>
        </div>
      </div>

      <div className="dot-grid p-3 p-md-4">
        <div className="row g-3 g-md-4 align-items-center">
          {/* Catalog cluster on a peach wash */}
          <div className="col-lg-6">
            <div className="peach-wash p-3 position-relative">
              <span className="annotation-tag position-absolute" style={{ top: -12, right: 16 }}>Live availability</span>
              <div className="row g-2">
                {MOCK_ITEMS.map((item) => {
                  const { icon: Icon, bg, fg } = categoryMeta(item.category);
                  return (
                    <div className="col-4" key={item.name}>
                      <div className="mock-card h-100">
                        <div className="mock-thumb" style={{ background: bg, color: fg }}><Icon size={22} /></div>
                        <div className="fw-semibold text-truncate small">{item.name}</div>
                        <div className="small">{item.rate}<span className="text-muted">/day</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Request → approval flow inside a highlight frame */}
          <div className="col-lg-6">
            <div className="highlight-frame position-relative">
              <span className="annotation-tag position-absolute" style={{ top: -12, left: 16 }}>Admin approval</span>
              <div className="d-flex flex-column flex-sm-row align-items-stretch gap-2 gap-sm-0">
                {FLOW.map(({ icon: Icon, title, text }, i) => (
                  <div key={title} className="d-flex flex-sm-row align-items-stretch flex-grow-1 min-w-0">
                    <div className="flow-step flex-grow-1">
                      <span className="flow-step-mark"><Icon size={14} /></span>
                      <div className="fw-semibold">{title}</div>
                      <div className="text-muted text-truncate" style={{ fontSize: 12 }}>{text}</div>
                    </div>
                    {i < FLOW.length - 1 && <span className="flow-connector d-none d-sm-block mx-1" />}
                  </div>
                ))}
              </div>
              <div className="d-flex align-items-center gap-2 mt-3 small">
                <ArrowRepeat />
                <span className="mock-line flex-grow-1" />
                <span className="badge bg-success">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

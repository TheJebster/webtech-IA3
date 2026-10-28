import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../../utils/format';

const compactINR = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(v >= 1000000 ? 0 : 1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);

// KPI tile: icon chip, label, big value, hint and an optional change badge
export function KpiCard({ icon: Icon, tone, label, value, hint, change }) {
  return (
    <div className="kpi stat">
      <div className="d-flex justify-content-between align-items-start">
        <span className={`kpi-icon tone-${tone}`}><Icon size={22} stroke={1.8} /></span>
        {change !== undefined && change !== null && (
          <span className={`kpi-change ${change >= 0 ? 'up' : 'down'}`}>{change >= 0 ? '▲' : '▼'} {Math.abs(change)}%</span>
        )}
      </div>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

// Single-series bar chart of monthly revenue (one hue, hover tooltip, recessive axes)
export function RevenueChart({ data }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="#e4ded3" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b625e', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b625e', fontSize: 12 }} tickFormatter={compactINR} width={52} />
          <Tooltip
            cursor={{ fill: 'rgba(36, 31, 33, 0.05)' }}
            formatter={(v, _n, p) => [`${formatCurrency(v)} · ${p.payload.rentals} rental${p.payload.rentals === 1 ? '' : 's'}`, 'Revenue']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e4ded3', fontSize: 13 }}
          />
          <Bar dataKey="revenue" fill="#241f21" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const STATUS_COLORS = {
  pending: '#b45309',
  approved: '#15803d',
  returned: '#1d4ed8',
  rejected: '#b91c1c',
  cancelled: '#a8a29e',
};

// Donut of rentals by status with a labelled legend (status is never colour-only)
export function StatusDonut({ byStatus, labels }) {
  const data = Object.keys(STATUS_COLORS).map((s) => ({ key: s, name: labels[s], value: byStatus[s] || 0 }));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
      <div style={{ width: 170, height: 170, position: 'relative', flexShrink: 0 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {data.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 12, border: '1px solid #e4ded3', fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center"><strong>{total}</strong><span>rentals</span></div>
      </div>
      <ul className="legend-list">
        {data.map((d) => (
          <li key={d.key}>
            <span className="legend-dot" style={{ background: STATUS_COLORS[d.key] }} />
            <span className="flex-grow-1">{d.name}</span>
            <strong>{d.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Circular gauge for "units out today"
export function UtilizationRing({ value, total }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="d-flex align-items-center gap-3">
      <svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label={`${pct}% of units out today`}>
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e9e778" strokeWidth="12" />
        <circle
          cx="64" cy="64" r={r} fill="none" stroke="#241f21" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 64 64)"
        />
        <text x="64" y="62" textAnchor="middle" fontSize="24" fontWeight="800" fill="#241f21">{pct}%</text>
        <text x="64" y="80" textAnchor="middle" fontSize="11" fill="#6b625e">in use</text>
      </svg>
      <div>
        <div className="fw-bold" style={{ color: 'var(--ink)', fontSize: 18 }}>{value} of {total} units</div>
        <div className="small text-muted">are out with customers today</div>
      </div>
    </div>
  );
}

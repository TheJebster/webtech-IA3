// Consistent page title row with optional actions on the right
export default function PageHeader({ title, sticker, subtitle, children }) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
      <div>
        <h1 className="h2 mb-1">
          {title}
          {sticker && <> <span className="sticker" aria-hidden="true">{sticker}</span></>}
        </h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

// Page title in the ultralight display cut, with optional text actions beneath
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5">
      <h1 className="mb-2">{title}</h1>
      {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      {children && <div className="action-row mt-4">{children}</div>}
    </div>
  );
}

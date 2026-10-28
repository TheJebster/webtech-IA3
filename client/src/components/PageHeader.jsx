import SplitText from '../motion/SplitText';

// Page title (and muted subtitle) on the left, actions on the right
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <SplitText as="h1" className="mb-0">{title}</SplitText>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="action-row">{children}</div>}
    </div>
  );
}

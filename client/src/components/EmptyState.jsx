export default function EmptyState({ title, text, children }) {
  return (
    <div className="py-4">
      <h2 className="mb-2">{title}</h2>
      {text && <p className="text-muted mb-3">{text}</p>}
      {children}
    </div>
  );
}

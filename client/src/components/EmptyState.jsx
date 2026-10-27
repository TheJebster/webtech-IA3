import { Inbox } from 'react-bootstrap-icons';

export default function EmptyState({ icon: Icon = Inbox, title, text, children }) {
  return (
    <div className="text-center py-5 px-3 text-muted">
      <Icon size={40} className="mb-3 opacity-50" />
      <h2 className="h5 fw-semibold text-body">{title}</h2>
      {text && <p className="mb-3">{text}</p>}
      {children}
    </div>
  );
}

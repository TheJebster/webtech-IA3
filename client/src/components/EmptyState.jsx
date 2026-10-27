import { Inbox } from 'react-bootstrap-icons';

export default function EmptyState({ icon: Icon = Inbox, title, text, children }) {
  return (
    <div className="text-center py-5 px-3">
      <Icon size={36} className="mb-3 text-muted" />
      <h2 className="h3 mb-2">{title}</h2>
      {text && <p className="text-muted mb-3">{text}</p>}
      {children}
    </div>
  );
}

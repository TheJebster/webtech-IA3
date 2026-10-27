// Status as type alone: open states in ink, closed states recede to ash
export const STATUS_META = {
  pending: { label: 'Pending', open: true },
  approved: { label: 'Approved', open: true },
  rejected: { label: 'Rejected', open: false },
  cancelled: { label: 'Cancelled', open: false },
  returned: { label: 'Returned', open: false },
};

export default function RentalStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, open: false };
  return <span className={`status ${meta.open ? 'status-active' : 'status-closed'}`}>{meta.label}</span>;
}

export const STATUS_META = {
  pending: { label: 'Pending' },
  approved: { label: 'Approved' },
  rejected: { label: 'Rejected' },
  cancelled: { label: 'Cancelled' },
  returned: { label: 'Returned' },
};

// Status pill: pending amber, approved green, rejected red, returned blue, cancelled grey
export default function RentalStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status };
  return <span className={`status status-${status}`}>{meta.label}</span>;
}

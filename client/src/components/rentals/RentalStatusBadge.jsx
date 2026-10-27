export const STATUS_META = {
  pending: { label: 'Pending' },
  approved: { label: 'Approved' },
  rejected: { label: 'Rejected' },
  cancelled: { label: 'Cancelled' },
  returned: { label: 'Returned' },
};

// Status tag: neutral chip with a colour-coded dot (pending violet, approved green, rejected red, returned teal)
export default function RentalStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status };
  return <span className={`status status-${status}`}>{meta.label}</span>;
}

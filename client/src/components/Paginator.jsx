import { Pagination } from 'react-bootstrap';

// Compact pagination: first, prev, a window of pages, next, last
export default function Paginator({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const numbers = [];
  for (let n = start; n <= end; n++) numbers.push(n);

  return (
    <Pagination className="justify-content-center mb-0 flex-wrap">
      <Pagination.First disabled={page === 1} onClick={() => onChange(1)} />
      <Pagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} />
      {numbers.map((n) => (
        <Pagination.Item key={n} active={n === page} onClick={() => onChange(n)}>{n}</Pagination.Item>
      ))}
      <Pagination.Next disabled={page === pages} onClick={() => onChange(page + 1)} />
      <Pagination.Last disabled={page === pages} onClick={() => onChange(pages)} />
    </Pagination>
  );
}

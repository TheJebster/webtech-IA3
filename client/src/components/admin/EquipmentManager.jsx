import { useCallback, useEffect, useState } from 'react';
import { Col, Form, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api, { parseError } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';
import ConditionBadge from '../ConditionBadge';
import ConfirmModal from '../ConfirmModal';
import Paginator from '../Paginator';
import PageLoader from '../PageLoader';
import EmptyState from '../EmptyState';
import EquipmentFormModal from './EquipmentFormModal';

const PAGE_SIZE = 10;

export default function EquipmentManager() {
  const notify = useToast();
  const [meta, setMeta] = useState({ categories: [], conditions: [] });
  const [filters, setFilters] = useState({ q: '', category: '', status: 'all', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, item = edit
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const q = useDebounce(filters.q);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/equipment', {
        params: { q, category: filters.category || undefined, status: filters.status, sort: filters.sort, page, limit: PAGE_SIZE },
      });
      setData(res);
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [q, filters.category, filters.status, filters.sort, page, notify]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.get('/equipment/meta').then(({ data: res }) => setMeta(res)).catch(() => {});
  }, []);

  const setFilter = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleSaved = (item, isEdit) => {
    setEditing(null);
    notify(isEdit ? `“${item.name}” updated.` : `“${item.name}” added to the catalog.`);
    load();
  };

  const toggleActive = async (item) => {
    try {
      await api.put(`/equipment/${item._id}`, { isActive: !item.isActive });
      notify(`“${item.name}” is now ${item.isActive ? 'hidden from' : 'visible to'} customers.`, 'secondary');
      load();
    } catch (err) {
      notify(parseError(err).message, 'danger');
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const { data: res } = await api.delete(`/equipment/${deleting._id}`);
      notify(res.message);
      setDeleting(null);
      // Step back a page if we just removed the last row on it
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      notify(parseError(err).message, 'danger');
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="action-row mb-4">
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>Add equipment</button>
      </div>
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Form.Control name="q" value={filters.q} onChange={setFilter} placeholder="Search name or description…" aria-label="Search equipment" />
        </Col>
        <Col xs={4} lg={2}>
          <Form.Select name="category" value={filters.category} onChange={setFilter} aria-label="Category">
            <option value="">All categories</option>
            {meta.categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </Form.Select>
        </Col>
        <Col xs={4} lg={2}>
          <Form.Select name="status" value={filters.status} onChange={setFilter} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Hidden</option>
          </Form.Select>
        </Col>
        <Col xs={4} lg={2}>
          <Form.Select name="sort" value={filters.sort} onChange={setFilter} aria-label="Sort">
            <option value="newest">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="price_asc">Rate, low to high</option>
            <option value="price_desc">Rate, high to low</option>
          </Form.Select>
        </Col>
      </Row>

      <div className="small text-muted mb-3">{data.total} item{data.total === 1 ? '' : 's'}</div>

      {loading ? (
        <PageLoader />
      ) : data.items.length === 0 ? (
        <EmptyState title="No equipment found" text="Try a different search or filter, or add new equipment." />
      ) : (
        <Table responsive className="mb-4 ops-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th className="d-none d-md-table-cell">Category</th>
              <th className="text-end">Rate / day</th>
              <th className="text-end d-none d-sm-table-cell">Qty</th>
              <th className="d-none d-lg-table-cell">Condition</th>
              <th className="d-none d-sm-table-cell">Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item._id} className={item.isActive ? '' : 'text-muted'}>
                <td><Link to={`/equipment/${item._id}`} className="fw-semibold">{item.name}</Link></td>
                <td className="text-nowrap d-none d-md-table-cell">{item.category}</td>
                <td className="text-end text-nowrap">{formatCurrency(item.dailyRate)}</td>
                <td className="text-end d-none d-sm-table-cell">{item.quantityTotal}</td>
                <td className="d-none d-lg-table-cell"><ConditionBadge condition={item.condition} /></td>
                <td className="d-none d-sm-table-cell">
                  <span className={`status ${item.isActive ? 'status-active' : 'status-closed'}`}>{item.isActive ? 'Active' : 'Hidden'}</span>
                </td>
                <td className="text-end">
                  <span className="action-row justify-content-end flex-nowrap">
                    <button type="button" className="text-action" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}>Edit</button>
                    <button
                      type="button"
                      className="text-action quiet"
                      aria-label={item.isActive ? `Hide ${item.name}` : `Show ${item.name}`}
                      onClick={() => toggleActive(item)}
                    >
                      {item.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" className="text-action quiet" aria-label={`Delete ${item.name}`} onClick={() => setDeleting(item)}>Delete</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Paginator page={page} pages={data.pages} onChange={setPage} />

      <EquipmentFormModal
        show={editing !== null}
        item={editing?._id ? editing : null}
        categories={meta.categories}
        conditions={meta.conditions}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />

      <ConfirmModal
        show={Boolean(deleting)}
        title="Delete equipment?"
        body={<>This permanently removes <strong>{deleting?.name}</strong> from the catalog. To keep it for records, hide it instead.</>}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

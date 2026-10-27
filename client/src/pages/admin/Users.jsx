import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import {
  PencilSquare, PeopleFill, PersonBadge, PersonCheck, PersonDash, PersonPlus, PersonSlash, Search, Trash3,
} from 'react-bootstrap-icons';
import api, { parseError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useDebounce from '../../hooks/useDebounce';
import { formatDate, timeAgo } from '../../utils/format';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ConfirmModal from '../../components/ConfirmModal';
import Paginator from '../../components/Paginator';
import PageLoader from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import UserFormModal from '../../components/admin/UserFormModal';

const PAGE_SIZE = 10;
const initials = (name) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export default function Users() {
  const { user: me } = useAuth();
  const notify = useToast();
  const [filters, setFilters] = useState({ q: '', role: '', status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1, summary: null });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const q = useDebounce(filters.q);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/users', {
        params: { q: q || undefined, role: filters.role || undefined, status: filters.status || undefined, page, limit: PAGE_SIZE },
      });
      setData(res);
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [q, filters.role, filters.status, page, notify]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleSaved = (saved, isEdit) => {
    setEditing(null);
    notify(isEdit ? `${saved.name}’s details were updated.` : `${saved.name} was added as ${saved.role === 'admin' ? 'an admin' : 'a user'}.`);
    load();
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      notify(`${u.name} was ${u.isActive ? 'deactivated' : 'activated'}.`, 'secondary');
      load();
    } catch (err) {
      notify(parseError(err).message, 'danger');
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      const { data: res } = await api.delete(`/users/${deleting._id}`);
      notify(res.message);
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      notify(parseError(err).message, 'danger');
    } finally {
      setDeleting(null);
      setBusy(false);
    }
  };

  const s = data.summary;

  return (
    <Container className="py-4">
      <PageHeader title="User management" subtitle="Add, update, deactivate and remove user accounts.">
        <Button onClick={() => setEditing({})}><PersonPlus className="me-1" />Add user</Button>
      </PageHeader>

      {s && (
        <Row xs={2} lg={4} className="g-3 mb-4">
          <Col><StatCard icon={PeopleFill} label="Accounts" value={s.total} /></Col>
          <Col><StatCard icon={PersonBadge} label="Admins" value={s.admins} accent="info" /></Col>
          <Col><StatCard icon={PersonCheck} label="Active" value={s.active} accent="success" /></Col>
          <Col><StatCard icon={PersonSlash} label="Deactivated" value={s.inactive} accent="secondary" /></Col>
        </Row>
      )}

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-3 p-md-4">
          <Row className="g-2 mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><Search /></InputGroup.Text>
                <Form.Control name="q" value={filters.q} onChange={setFilter} placeholder="Search name, email or phone…" aria-label="Search users" />
              </InputGroup>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select name="role" value={filters.role} onChange={setFilter} aria-label="Role">
                <option value="">All roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Select name="status" value={filters.status} onChange={setFilter} aria-label="Status">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Deactivated</option>
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <PageLoader />
          ) : data.items.length === 0 ? (
            <EmptyState icon={PeopleFill} title="No users found" text="Try a different search or filter." />
          ) : (
            <Table responsive hover className="align-middle mb-3 ops-table">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th className="d-none d-lg-table-cell">Phone</th>
                  <th>Role</th>
                  <th className="d-none d-sm-table-cell">Status</th>
                  <th className="d-none d-lg-table-cell">Joined</th>
                  <th className="d-none d-md-table-cell">Last login</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => {
                  const isSelf = u._id === me._id;
                  return (
                    <tr key={u._id} className={u.isActive ? '' : 'opacity-75'}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`avatar ops-thumb ${u.role === 'admin' ? 'avatar-admin' : ''}`}>{initials(u.name)}</div>
                          <div className="min-w-0">
                            <div className="fw-semibold text-nowrap">
                              {u.name} {isSelf && <Badge bg="light" text="dark" className="border ms-1">You</Badge>}
                            </div>
                            <div className="small text-muted">{u.email}</div>
                            {!u.isActive && <Badge bg="secondary-subtle" text="secondary" className="d-sm-none">Deactivated</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="text-nowrap d-none d-lg-table-cell">{u.phone || <span className="text-muted">—</span>}</td>
                      <td>
                        <Badge bg={u.role === 'admin' ? 'primary' : 'light'} text={u.role === 'admin' ? undefined : 'dark'} className={u.role === 'admin' ? '' : 'border'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="d-none d-sm-table-cell">
                        {u.isActive
                          ? <Badge bg="success-subtle" text="success">Active</Badge>
                          : <Badge bg="secondary-subtle" text="secondary">Deactivated</Badge>}
                      </td>
                      <td className="text-nowrap small d-none d-lg-table-cell">{formatDate(u.createdAt)}</td>
                      <td className="text-nowrap small text-muted d-none d-md-table-cell">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</td>
                      <td className="text-end">
                        <ButtonGroup size="sm">
                          <Button variant="outline-secondary" title="Edit" aria-label={`Edit ${u.name}`} onClick={() => setEditing(u)}>
                            <PencilSquare />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            title={isSelf ? 'You can’t deactivate yourself' : u.isActive ? 'Deactivate' : 'Activate'}
                            aria-label={`${u.isActive ? 'Deactivate' : 'Activate'} ${u.name}`}
                            disabled={isSelf}
                            onClick={() => toggleActive(u)}
                          >
                            {u.isActive ? <PersonDash /> : <PersonCheck />}
                          </Button>
                          <Button
                            variant="outline-danger"
                            title={isSelf ? 'You can’t delete yourself' : 'Remove user'}
                            aria-label={`Remove ${u.name}`}
                            disabled={isSelf}
                            onClick={() => setDeleting(u)}
                          >
                            <Trash3 />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          <Paginator page={page} pages={data.pages} onChange={setPage} />
        </Card.Body>
      </Card>

      <UserFormModal
        show={editing !== null}
        user={editing?._id ? editing : null}
        currentUserId={me._id}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />

      <ConfirmModal
        show={Boolean(deleting)}
        title="Remove user?"
        body={<>This permanently deletes <strong>{deleting?.name}</strong> ({deleting?.email}). To keep their history, deactivate the account instead.</>}
        confirmLabel="Remove user"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </Container>
  );
}

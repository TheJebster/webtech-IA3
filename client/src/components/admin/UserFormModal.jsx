import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import api, { parseError } from '../../api/client';
import PasswordInput from '../PasswordInput';
import PasswordStrength from '../PasswordStrength';
import { hasErrors, validateEmail, validateName, validatePassword, validatePhone } from '../../utils/validators';

const EMPTY = { name: '', email: '', phone: '', role: 'user', isActive: true, password: '' };

// Add a user (password required) or edit one (password = optional reset)
export default function UserFormModal({ show, user, currentUserId, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const isSelf = isEdit && user._id === currentUserId;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(user ? { ...EMPTY, ...user, phone: user.phone || '', password: '' } : EMPTY);
      setErrors({});
      setServerError('');
    }
  }, [show, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((errs) => ({ ...errs, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: isEdit && !form.password ? '' : validatePassword(form.password),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      ...(isEdit && { isActive: form.isActive }),
      ...(form.password && { password: form.password }),
    };
    if (isSelf) {
      delete payload.role;
      delete payload.isActive;
    }

    setSaving(true);
    setServerError('');
    try {
      const { data } = isEdit ? await api.put(`/users/${user._id}`, payload) : await api.post('/users', payload);
      onSaved(data.user, isEdit);
    } catch (err) {
      const parsed = parseError(err);
      setServerError(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setSaving(false);
    }
  };

  const fieldProps = (name) => ({ name, value: form[name], onChange: handleChange, isInvalid: Boolean(errors[name]) });

  return (
    <Modal show={show} onHide={saving ? undefined : onClose} centered backdrop="static">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving}>
          <Modal.Title>{isEdit ? `Edit ${user.name}` : 'Add new user'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group controlId="u-name">
                <Form.Label>Full name <span className="text-danger">*</span></Form.Label>
                <Form.Control {...fieldProps('name')} />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={7}>
              <Form.Group controlId="u-email">
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control {...fieldProps('email')} type="email" />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={5}>
              <Form.Group controlId="u-phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control {...fieldProps('phone')} type="tel" />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="u-role">
                <Form.Label>Role</Form.Label>
                <Form.Select {...fieldProps('role')} disabled={isSelf}>
                  <option value="user">User (customer)</option>
                  <option value="admin">Admin</option>
                </Form.Select>
                {isSelf && <Form.Text>You can’t change your own role.</Form.Text>}
              </Form.Group>
            </Col>
            {isEdit && (
              <Col sm={6} className="d-flex align-items-sm-end">
                <Form.Check
                  type="checkbox"
                  id="u-active"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  disabled={isSelf}
                  label={form.isActive ? 'Account active' : 'Account deactivated'}
                  className="mb-sm-2"
                />
              </Col>
            )}
            <Col xs={12}>
              <Form.Group controlId="u-password">
                <Form.Label>
                  {isEdit ? <>Reset password <span className="text-muted small">(leave blank to keep current)</span></> : <>Password <span className="text-danger">*</span></>}
                </Form.Label>
                <PasswordInput {...fieldProps('password')} autoComplete="new-password" error={errors.password} />
                {(!isEdit || form.password) && <PasswordStrength password={form.password} />}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

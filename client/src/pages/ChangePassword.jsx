import { useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldLock } from 'react-bootstrap-icons';
import { homePathFor, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../api/client';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import { hasErrors, validatePassword } from '../utils/validators';
import usePageTitle from '../hooks/usePageTitle';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

function validate(form) {
  let newPassword = validatePassword(form.newPassword);
  if (!newPassword && form.newPassword === form.currentPassword) {
    newPassword = 'New password must be different from the current one';
  }
  return {
    currentPassword: form.currentPassword ? '' : 'Current password is required',
    newPassword,
    confirmPassword: !form.confirmPassword
      ? 'Please confirm your new password'
      : form.confirmPassword !== form.newPassword
        ? 'Passwords do not match'
        : '',
  };
}

export default function ChangePassword() {
  usePageTitle('Change password');
  const { user, changePassword } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await changePassword(form);
      notify('Password changed successfully.');
      navigate(homePathFor(user));
    } catch (err) {
      const { message, errors: fieldErrors } = parseError(err);
      setServerError(message);
      setErrors(fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Card className="auth-card">
        <Card.Body className="p-4 p-sm-5">
          <div className="icon-circle black mb-3"><ShieldLock size={22} /></div>
          <h1 className="h2 mb-1">Change password <span className="sticker" aria-hidden="true">🔐</span></h1>
          <p className="text-muted mb-4">Keep your account secure with a strong password.</p>

          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Label>Current password</Form.Label>
              <PasswordInput name="currentPassword" autoComplete="current-password" value={form.currentPassword} onChange={handleChange} error={errors.currentPassword} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New password</Form.Label>
              <PasswordInput name="newPassword" autoComplete="new-password" value={form.newPassword} onChange={handleChange} error={errors.newPassword} />
              <PasswordStrength password={form.newPassword} />
            </Form.Group>
            <Form.Group className="mb-4" controlId="confirmPassword">
              <Form.Label>Confirm new password</Form.Label>
              <PasswordInput name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
              <Button type="submit" className="flex-grow-1" disabled={submitting}>
                {submitting ? <><Spinner size="sm" className="me-2" />Saving…</> : 'Update password'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

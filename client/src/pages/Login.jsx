import { useState } from 'react';
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../api/client';
import PasswordInput from '../components/PasswordInput';
import { hasErrors, validateEmail } from '../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
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
    const nextErrors = {
      email: validateEmail(form.email),
      password: form.password ? '' : 'Password is required',
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      notify(`Welcome back, ${user.name}!`);
      // GuestRoute takes over once the user is set; this is a fallback with the same target
      navigate(location.state?.from?.pathname || homePathFor(user), { replace: true });
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
      <Card className="auth-card border-0 shadow">
        <Card.Body className="p-4 p-sm-5">
          <h1 className="h3 fw-bold mb-1">Log in</h1>
          <p className="text-muted mb-4">Welcome back to RentKit.</p>

          {serverError && <Alert variant="danger">{serverError}</Alert>}

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                isInvalid={Boolean(errors.email)}
                autoFocus
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <PasswordInput
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
              />
            </Form.Group>

            <Button type="submit" className="w-100" size="lg" disabled={submitting}>
              {submitting ? <><Spinner size="sm" className="me-2" />Logging in…</> : 'Log in'}
            </Button>
          </Form>

          <p className="text-center text-muted mt-4 mb-0">
            New to RentKit? <Link to="/signup">Create an account</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseError } from '../api/client';
import PasswordInput from '../components/PasswordInput';
import PasswordStrength from '../components/PasswordStrength';
import { hasErrors, validateEmail, validateName, validatePassword, validatePhone } from '../utils/validators';
import usePageTitle from '../hooks/usePageTitle';

const EMPTY = { name: '', email: '', phone: '', password: '', confirmPassword: '' };

function validate(form) {
  return {
    name: validateName(form.name),
    email: validateEmail(form.email),
    phone: validatePhone(form.phone),
    password: validatePassword(form.password),
    confirmPassword: !form.confirmPassword
      ? 'Please confirm your password'
      : form.confirmPassword !== form.password
        ? 'Passwords do not match'
        : '',
  };
}

export default function Signup() {
  usePageTitle('Sign up');
  const { signup } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live validation: show a field's error once it has been touched
  const clientErrors = validate(form);
  const errorFor = (field) => serverErrors[field] || (touched[field] ? clientErrors[field] : '');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setServerErrors((errs) => ({ ...errs, [e.target.name]: '' }));
  };
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (hasErrors(clientErrors)) return;

    setSubmitting(true);
    try {
      const user = await signup({ ...form, name: form.name.trim(), email: form.email.trim() });
      notify(`Welcome to RentKit, ${user.name}!`);
      navigate(homePathFor(user), { replace: true });
    } catch (err) {
      const { message, errors } = parseError(err);
      setServerError(message);
      setServerErrors(errors);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-wide">
        <h1 className="mb-2">Create your account</h1>
        <p className="text-muted mb-4">Rent equipment for your next event in minutes.</p>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        <Form noValidate onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col sm={6}>
              <Form.Group controlId="name">
                <Form.Label>Full name <span className="text-danger">*</span></Form.Label>
                <Form.Control {...field('name')} autoComplete="name" placeholder="Riya Sharma" isInvalid={Boolean(errorFor('name'))} />
                <Form.Control.Feedback type="invalid">{errorFor('name')}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="phone">
                <Form.Label>Phone <span className="text-muted small">(optional)</span></Form.Label>
                <Form.Control {...field('phone')} type="tel" autoComplete="tel" placeholder="98765 43210" isInvalid={Boolean(errorFor('phone'))} />
                <Form.Control.Feedback type="invalid">{errorFor('phone')}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="email">
                <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                <Form.Control {...field('email')} type="email" autoComplete="email" placeholder="you@example.com" isInvalid={Boolean(errorFor('email'))} />
                <Form.Control.Feedback type="invalid">{errorFor('email')}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="password">
                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                <PasswordInput {...field('password')} autoComplete="new-password" placeholder="Create a strong password" error={errorFor('password')} />
                <PasswordStrength password={form.password} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group controlId="confirmPassword">
                <Form.Label>Confirm password <span className="text-danger">*</span></Form.Label>
                <PasswordInput {...field('confirmPassword')} autoComplete="new-password" placeholder="Re-enter your password" error={errorFor('confirmPassword')} />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" variant="primary" className="mt-5" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Sign up'}
          </Button>
        </Form>

        <p className="text-muted mt-5 mb-0">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

import { ProgressBar } from 'react-bootstrap';
import { CheckCircleFill, Circle } from 'react-bootstrap-icons';
import { PASSWORD_CHECKS, passwordScore } from '../utils/validators';

const LEVELS = [
  { label: 'Too weak', variant: 'danger' },
  { label: 'Too weak', variant: 'danger' },
  { label: 'Weak', variant: 'danger' },
  { label: 'Fair', variant: 'warning' },
  { label: 'Good', variant: 'info' },
  { label: 'Strong', variant: 'success' },
];

export default function PasswordStrength({ password }) {
  const score = passwordScore(password);
  const level = LEVELS[score];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="d-flex align-items-center gap-2 mb-2">
        <ProgressBar now={(score / PASSWORD_CHECKS.length) * 100} variant={level.variant} className="flex-grow-1" style={{ height: 6 }} />
        <small className={`text-${level.variant} fw-semibold`} style={{ minWidth: 60 }}>
          {password ? level.label : ''}
        </small>
      </div>
      <ul className="list-unstyled small mb-0 row row-cols-1 row-cols-sm-2 g-1">
        {PASSWORD_CHECKS.map((check) => {
          const ok = check.test(password);
          return (
            <li key={check.id} className={`col ${ok ? 'text-success' : 'text-muted'}`}>
              {ok ? <CheckCircleFill className="me-1" /> : <Circle className="me-1" />}
              {check.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { IconCheck, IconPoint } from '@tabler/icons-react';
import { PASSWORD_CHECKS, passwordScore } from '../utils/validators';

const LEVELS = ['Too weak', 'Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

// Strength in words plus a checklist — met rules in ink, unmet in ash
export default function PasswordStrength({ password }) {
  const score = passwordScore(password);
  return (
    <div className="mt-3" aria-live="polite">
      <div className="small mb-2">
        Strength: <strong>{password ? LEVELS[score] : '—'}</strong> <span className="text-muted">({score}/{PASSWORD_CHECKS.length})</span>
      </div>
      <ul className="list-unstyled small mb-0 row row-cols-1 row-cols-sm-2 g-1">
        {PASSWORD_CHECKS.map((check) => {
          const ok = check.test(password);
          return (
            <li key={check.id} className={`col pw-check ${ok ? 'is-ok' : 'text-muted'}`}>
              {ok ? <IconCheck size={14} stroke={2.4} /> : <IconPoint size={14} />} {check.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

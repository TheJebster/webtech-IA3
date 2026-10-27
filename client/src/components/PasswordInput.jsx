import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

// Password field with a text "Show / Hide" toggle and inline validation feedback
export default function PasswordInput({ error, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup hasValidation>
      <Form.Control type={visible ? 'text' : 'password'} isInvalid={Boolean(error)} {...props} />
      <Button
        variant="outline-secondary"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? 'Hide' : 'Show'}
      </Button>
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </InputGroup>
  );
}

import { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';

// Password field with a show/hide toggle and inline validation feedback
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
        {visible ? <EyeSlash /> : <Eye />}
      </Button>
      <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
    </InputGroup>
  );
}

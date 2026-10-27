import { Button, Modal } from 'react-bootstrap';

export default function ConfirmModal({
  show, title = 'Are you sure?', body, confirmLabel = 'Confirm', busy = false, onConfirm, onCancel,
}) {
  return (
    <Modal show={show} onHide={busy ? undefined : onCancel} centered>
      <Modal.Header closeButton={!busy}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
        <Button variant="outline-secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

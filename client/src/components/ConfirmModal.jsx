import { Button, Modal, Spinner } from 'react-bootstrap';

export default function ConfirmModal({
  show, title = 'Are you sure?', body, confirmLabel = 'Confirm', variant = 'danger', busy = false, onConfirm, onCancel,
}) {
  return (
    <Modal show={show} onHide={busy ? undefined : onCancel} centered>
      <Modal.Header closeButton={!busy}>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} disabled={busy}>
          {busy && <Spinner size="sm" className="me-2" />}
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

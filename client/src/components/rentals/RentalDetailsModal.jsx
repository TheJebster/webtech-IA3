import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import { formatCurrency, formatDateTime, formatDayRange } from '../../utils/format';
import RentalStatusBadge from './RentalStatusBadge';

// Read-only rental summary shared by the customer and admin views
export default function RentalDetailsModal({ rental, show, onClose, showCustomer = false, footer }) {
  if (!rental) return null;
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 flex-wrap">
          {rental.eventName} <span className="mono small fw-normal">{rental.code}</span>
          <RentalStatusBadge status={rental.status} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-3 mb-3 small">
          {showCustomer && (
            <Col sm={6}>
              <div className="text-muted">Customer</div>
              <div className="fw-semibold">{rental.customerName}</div>
              <div>{rental.customerEmail}</div>
            </Col>
          )}
          <Col sm={6}>
            <div className="text-muted">Venue</div>
            <div className="fw-semibold">{rental.venue}</div>
          </Col>
          <Col sm={6}>
            <div className="text-muted">Dates</div>
            <div className="fw-semibold">{formatDayRange(rental.startDate, rental.endDate)} · {rental.days} day{rental.days > 1 ? 's' : ''}</div>
          </Col>
          <Col sm={6}>
            <div className="text-muted">Requested</div>
            <div>{formatDateTime(rental.createdAt)}</div>
          </Col>
          {rental.notes && (
            <Col xs={12}>
              <div className="text-muted">Customer notes</div>
              <div>{rental.notes}</div>
            </Col>
          )}
          {rental.adminNote && (
            <Col xs={12}>
              <div className="text-muted">Note from RentKit</div>
              <div className="fw-semibold">{rental.adminNote}</div>
            </Col>
          )}
        </Row>
        <Table responsive size="sm" className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Item</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Rate / day</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {rental.items.map((item) => (
              <tr key={item.equipment}>
                <td>{item.name}<div className="small text-muted">{item.category}</div></td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end text-nowrap">{formatCurrency(item.dailyRate)}</td>
                <td className="text-end text-nowrap">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-end fw-semibold">Total ({rental.days} day{rental.days > 1 ? 's' : ''})</td>
              <td className="text-end fw-bold text-nowrap">{formatCurrency(rental.totalCost)}</td>
            </tr>
          </tfoot>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        {footer}
        <Button variant="outline-secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

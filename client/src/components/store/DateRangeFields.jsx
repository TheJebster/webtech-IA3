import { Col, Form, Row } from 'react-bootstrap';
import { todayInput } from '../../utils/format';

// Start/end date pair used for availability checks; end can't be before start
export default function DateRangeFields({ start, end, onChange, idPrefix = 'dates', size, stacked = false }) {
  return (
    <Row className="g-2">
      <Col xs={stacked ? 12 : 6}>
        <Form.Group controlId={`${idPrefix}-start`}>
          <Form.Label>From</Form.Label>
          <Form.Control
            type="date"
            size={size}
            min={todayInput()}
            value={start}
            onChange={(e) => onChange({ start: e.target.value, end: end && end < e.target.value ? e.target.value : end })}
          />
        </Form.Group>
      </Col>
      <Col xs={stacked ? 12 : 6}>
        <Form.Group controlId={`${idPrefix}-end`}>
          <Form.Label>To</Form.Label>
          <Form.Control type="date" size={size} min={start || todayInput()} value={end} onChange={(e) => onChange({ start, end: e.target.value })} />
        </Form.Group>
      </Col>
    </Row>
  );
}

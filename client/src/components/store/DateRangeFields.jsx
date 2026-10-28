import { Col, Form, Row } from 'react-bootstrap';
import { todayInput } from '../../utils/format';
import DateInput from '../DateInput';

// Start/end date pair used for availability checks; end can't be before start
export default function DateRangeFields({ start, end, onChange, idPrefix = 'dates', size, stacked = false }) {
  return (
    <Row className="g-2">
      <Col xs={stacked ? 12 : 6}>
        <Form.Group controlId={`${idPrefix}-start`}>
          <Form.Label>From</Form.Label>
          <DateInput
            id={`${idPrefix}-start`}
            size={size}
            min={todayInput()}
            value={start}
            onChange={(v) => onChange({ start: v, end: end && end < v ? v : end })}
          />
        </Form.Group>
      </Col>
      <Col xs={stacked ? 12 : 6}>
        <Form.Group controlId={`${idPrefix}-end`}>
          <Form.Label>To</Form.Label>
          <DateInput id={`${idPrefix}-end`} size={size} min={start || todayInput()} value={end} onChange={(v) => onChange({ start, end: v })} />
        </Form.Group>
      </Col>
    </Row>
  );
}

import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap';
import api, { parseError } from '../../api/client';
import EquipmentImage from '../EquipmentImage';
import { hasErrors } from '../../utils/validators';

const EMPTY = {
  name: '', category: '', dailyRate: '', quantityTotal: '1', condition: 'Good',
  imageUrl: '', description: '', features: '', isActive: true,
};

const toForm = (item) =>
  item
    ? {
        ...EMPTY,
        ...item,
        dailyRate: String(item.dailyRate),
        quantityTotal: String(item.quantityTotal),
        features: (item.features || []).join('\n'),
      }
    : EMPTY;

function validate(form) {
  const rate = Number(form.dailyRate);
  const qty = Number(form.quantityTotal);
  return {
    name: !form.name.trim() ? 'Name is required' : form.name.length > 100 ? 'Name is too long' : '',
    category: form.category ? '' : 'Choose a category',
    dailyRate: form.dailyRate === '' ? 'Daily rate is required' : !(rate >= 1) ? 'Daily rate must be a positive number' : '',
    quantityTotal:
      form.quantityTotal === '' ? 'Quantity is required' : !Number.isInteger(qty) || qty < 0 ? 'Quantity must be a whole number ≥ 0' : '',
    imageUrl: form.imageUrl && !/^https?:\/\/\S+$/i.test(form.imageUrl.trim()) ? 'Image URL must start with http:// or https://' : '',
    description: form.description.length > 1000 ? 'Description is too long (max 1000)' : '',
  };
}

// Add / edit equipment. `item` null = create mode.
export default function EquipmentFormModal({ show, item, categories, conditions, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(item);

  useEffect(() => {
    if (show) {
      setForm(toForm(item));
      setErrors({});
      setServerError('');
    }
  }, [show, item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((errs) => ({ ...errs, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      dailyRate: Number(form.dailyRate),
      quantityTotal: Number(form.quantityTotal),
      condition: form.condition,
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    setSaving(true);
    setServerError('');
    try {
      const { data } = isEdit ? await api.put(`/equipment/${item._id}`, payload) : await api.post('/equipment', payload);
      onSaved(data.item, isEdit);
    } catch (err) {
      const parsed = parseError(err);
      setServerError(parsed.message);
      setErrors(parsed.errors);
    } finally {
      setSaving(false);
    }
  };

  const fieldProps = (name) => ({ name, value: form[name], onChange: handleChange, isInvalid: Boolean(errors[name]) });

  return (
    <Modal show={show} onHide={saving ? undefined : onClose} size="lg" centered backdrop="static">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving}>
          <Modal.Title className="h5">{isEdit ? `Edit “${item.name}”` : 'Add new equipment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          <Row className="g-3">
            <Col md={8}>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group controlId="eq-name">
                    <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control {...fieldProps('name')} placeholder="e.g. JBL PRX 815 Powered Speaker" />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group controlId="eq-category">
                    <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                    <Form.Select {...fieldProps('category')}>
                      <option value="">Select…</option>
                      {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group controlId="eq-condition">
                    <Form.Label>Condition</Form.Label>
                    <Form.Select {...fieldProps('condition')}>
                      {conditions.map((c) => <option key={c}>{c}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group controlId="eq-rate">
                    <Form.Label>Daily rate <span className="text-danger">*</span></Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text>₹</InputGroup.Text>
                      <Form.Control {...fieldProps('dailyRate')} type="number" min="1" step="1" placeholder="2500" />
                      <InputGroup.Text>/ day</InputGroup.Text>
                      <Form.Control.Feedback type="invalid">{errors.dailyRate}</Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group controlId="eq-qty">
                    <Form.Label>Quantity owned <span className="text-danger">*</span></Form.Label>
                    <Form.Control {...fieldProps('quantityTotal')} type="number" min="0" step="1" />
                    <Form.Control.Feedback type="invalid">{errors.quantityTotal}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <Form.Label>Preview</Form.Label>
              <EquipmentImage item={{ ...form, imageUrl: errors.imageUrl ? '' : form.imageUrl }} height={150} key={form.imageUrl} />
            </Col>
            <Col xs={12}>
              <Form.Group controlId="eq-image">
                <Form.Label>Image URL <span className="text-muted small">(optional)</span></Form.Label>
                <Form.Control {...fieldProps('imageUrl')} placeholder="https://…" />
                <Form.Control.Feedback type="invalid">{errors.imageUrl}</Form.Control.Feedback>
                <Form.Text>Leave blank to use the category illustration.</Form.Text>
              </Form.Group>
            </Col>
            <Col md={7}>
              <Form.Group controlId="eq-description">
                <Form.Label>Description</Form.Label>
                <Form.Control {...fieldProps('description')} as="textarea" rows={4} placeholder="What is it, and what events is it good for?" />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="eq-features">
                <Form.Label>Key features <span className="text-muted small">(one per line)</span></Form.Label>
                <Form.Control {...fieldProps('features')} as="textarea" rows={4} placeholder={'1500 W amplifier\nBluetooth'} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="eq-active"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                label="Visible to customers (active)"
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner size="sm" className="me-2" />}
            {isEdit ? 'Save changes' : 'Add equipment'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

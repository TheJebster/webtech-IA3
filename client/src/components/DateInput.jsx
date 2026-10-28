import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const pad = (n) => String(n).padStart(2, '0');
// Values stay "YYYY-MM-DD" strings (what the API and the rest of the app use); only the display is dd/mm/yyyy
const toDate = (value) => (value ? new Date(`${value}T00:00:00`) : null);
const toValue = (date) => (date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : '');

// Date field that always shows and accepts dd/mm/yyyy (native date inputs follow the browser locale).
// Typing works too; the calendar opens on focus. Pass `id` so a <Form.Label> (controlId) points at it.
export default function DateInput({ id, name, value, min, onChange, isInvalid = false, size, placeholder = 'dd/mm/yyyy' }) {
  return (
    <DatePicker
      id={id}
      name={name}
      selected={toDate(value)}
      minDate={toDate(min)}
      // Half-typed text (e.g. "02/1") can parse as a date in year 1; only accept complete, real dates
      onChange={(date) => {
        if (date && date.getFullYear() < 2000) return;
        onChange(toValue(date));
      }}
      strictParsing
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      className={`form-control${size ? ` form-control-${size}` : ''}${isInvalid ? ' is-invalid' : ''}`}
      wrapperClassName="date-input"
      calendarClassName="rk-calendar"
      popperPlacement="bottom-start"
      autoComplete="off"
      showPopperArrow={false}
      // Render the calendar above the page so scrolling panels (like the catalog filters) never clip it
      portalId="rk-date-portal"
    />
  );
}

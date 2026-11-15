/**
 * Reusable, accessible form controls. Each one links its label, help text
 * and error message to the input with id / aria-describedby, and marks
 * invalid fields with aria-invalid so screen readers announce the problem.
 */

function describedBy(id, help, error) {
  return [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
}

function Feedback({ id, help, error }) {
  return (
    <>
      {help && !error && <div id={`${id}-help`} className="form-text">{help}</div>}
      {error && <div id={`${id}-error`} className="invalid-feedback d-block">{error}</div>}
    </>
  );
}

export function TextField({ id, label, error, help, required, className = '', ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={id}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        aria-invalid={!!error}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, help, error)}
        {...props}
      />
      <Feedback id={id} help={help} error={error} />
    </div>
  );
}

export function TextArea({ id, label, error, help, required, className = '', ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        aria-invalid={!!error}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, help, error)}
        {...props}
      />
      <Feedback id={id} help={help} error={error} />
    </div>
  );
}

export function SelectField({ id, label, options, error, help, required, placeholder, className = '', ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
      </label>
      <select
        id={id}
        name={id}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        aria-invalid={!!error}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, help, error)}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
      <Feedback id={id} help={help} error={error} />
    </div>
  );
}

/** Group of checkboxes rendered as toggle chips inside a fieldset. */
export function CheckboxGroup({ id, legend, options, value, onChange, error, help }) {
  const toggle = (opt) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <fieldset className="mb-3" aria-describedby={describedBy(id, help, error)}>
      <legend className="form-label fs-6 mb-2">{legend}</legend>
      <div className="d-flex flex-wrap gap-2">
        {options.map((opt, i) => {
          const inputId = `${id}-${i}`;
          return (
            <div key={opt}>
              <input
                type="checkbox"
                className="btn-check"
                id={inputId}
                checked={value.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <label className="btn btn-sm btn-outline-primary rounded-pill" htmlFor={inputId}>{opt}</label>
            </div>
          );
        })}
      </div>
      <Feedback id={id} help={help} error={error} />
    </fieldset>
  );
}

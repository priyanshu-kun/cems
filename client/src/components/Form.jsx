import { classNames } from "../utils/format.js";

export function Field({ label, helper, error, children, htmlFor }) {
  return (
    <div className={classNames("field", error && "is-error")}>
      {label ? <label className="field-label" htmlFor={htmlFor}>{label}</label> : null}
      {children}
      {(error || helper) ? (
        <div className={classNames("field-helper", error && "is-error")}>{error || helper}</div>
      ) : null}
    </div>
  );
}

export function Input({ id, value, onChange, type = "text", placeholder, disabled, autoComplete, inputMode, ...rest }) {
  return (
    <input
      id={id}
      className="input"
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      inputMode={inputMode}
      {...rest}
    />
  );
}

export function Textarea({ id, value, onChange, placeholder, disabled, rows = 4, ...rest }) {
  return (
    <textarea
      id={id}
      className="textarea"
      value={value ?? ""}
      rows={rows}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      {...rest}
    />
  );
}

export function Select({ id, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="select-wrap">
      <select
        id={id}
        className="select"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>{o.label}</option>
          )
        )}
      </select>
    </div>
  );
}

export function Chips({ options, value = [], onChange }) {
  return (
    <div className="chips">
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const active = value.includes(v);
        return (
          <button
            key={v}
            type="button"
            className="chip"
            aria-pressed={active}
            onClick={() =>
              onChange(active ? value.filter((x) => x !== v) : [...value, v])
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={value === v}
            onClick={() => onChange(v)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Preview primitives — Button, Field, Card, Pill, Banner, etc.
const { Icon, MOCK } = window;

function cn(...xs) { return xs.filter(Boolean).join(" "); }

function Button({ variant = "primary", size, loading, disabled, block, children, leadingIcon, onClick, type = "button", className, ...rest }) {
  const cls = cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", size === "lg" && "btn-lg", block && "btn-block", className);
  return (
    <button type={type} className={cls} disabled={disabled || loading} onClick={onClick} {...rest}>
      {loading ? <span className="btn-spinner" /> : (
        <>
          {leadingIcon ? <Icon name={leadingIcon} size={size === "sm" ? 16 : 18} /> : null}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

function IconButton({ icon, label, onClick, size = 36, className }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className={cn("icon-btn", className)} style={{ width: size, height: size }}>
      <Icon name={icon} size={Math.round(size * 0.5)} />
    </button>
  );
}

function Field({ label, helper, error, children, htmlFor }) {
  return (
    <div className={cn("field", error && "is-error")}>
      {label ? <label className="field-label" htmlFor={htmlFor}>{label}</label> : null}
      {children}
      {(error || helper) ? <div className={cn("field-helper", error && "is-error")}>{error || helper}</div> : null}
    </div>
  );
}

function Input({ id, value, onChange, type = "text", placeholder, disabled, ...rest }) {
  return <input id={id} className="input" value={value ?? ""}
    onChange={e => onChange?.(e.target.value)} type={type} placeholder={placeholder} disabled={disabled} {...rest} />;
}
function Textarea({ id, value, onChange, placeholder, rows = 4 }) {
  return <textarea id={id} className="textarea" value={value ?? ""} rows={rows}
    onChange={e => onChange?.(e.target.value)} placeholder={placeholder} />;
}
function Select({ id, value, onChange, options, placeholder }) {
  return (
    <div className="select-wrap">
      <select id={id} className="select" value={value ?? ""} onChange={e => onChange?.(e.target.value)}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ children, className = "", as: As = "div", onClick }) {
  return <As className={cn("card", className)} onClick={onClick}>{children}</As>;
}

function Pill({ status, children, tone }) {
  return (
    <span className={cn("pill", status ? `pill-${status}` : tone && `pill-tone-${tone}`)}>
      {children || MOCK.statusLabel(status)}
    </span>
  );
}

function Banner({ kind = "info", icon, children }) {
  const iconName = icon || (kind === "danger" ? "alert" : kind === "warning" ? "alert-circle" : kind === "success" ? "check-circle" : "info");
  return (
    <div className={`banner banner-${kind}`}>
      <Icon name={iconName} size={18} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Avatar({ name, size }) {
  return <div className={cn("avatar", size === "lg" && "avatar-lg")}>{MOCK.initials(name)}</div>;
}

function Progress({ value, max }) {
  const pct = Math.min(100, (Number(value) / Math.max(Number(max), 1)) * 100);
  return <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>;
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map(o => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        return <button key={v} aria-selected={value === v} onClick={() => onChange(v)}>{label}</button>;
      })}
    </div>
  );
}

function EmptyState({ icon = "inbox", title, body, action }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={32} /></div>
      <div>
        {title ? <div className="t-strong" style={{ marginBottom: 4 }}>{title}</div> : null}
        {body ? <div className="t-small" style={{ maxWidth: 380, marginInline: "auto" }}>{body}</div> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

// QR placeholder
function QRPlaceholder({ seed = "abc" }) {
  const N = 25; const cells = [];
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  let r = h >>> 0;
  const next = () => { r ^= r << 13; r ^= r >>> 17; r ^= r << 5; r >>>= 0; return r / 0xffffffff; };
  const isFinder = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (isFinder(x, y)) continue;
    if (next() < 0.5) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0F172A" />);
  }
  const finder = (ox, oy, key) => (
    <g key={key}>
      <rect x={ox} y={oy} width={7} height={7} fill="#0F172A" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="#0F172A" />
    </g>
  );
  return (
    <svg className="qr-svg" viewBox={`0 0 ${N} ${N}`} width="100%" height="100%" shapeRendering="crispEdges">
      <rect width={N} height={N} fill="#fff" />
      {cells}{finder(0, 0, "tl")}{finder(N - 7, 0, "tr")}{finder(0, N - 7, "bl")}
    </svg>
  );
}

// Event card
function EventCard({ event, rsvped, onToggleRsvp, onOpen }) {
  const isFull = (event.rsvpCount || 0) >= (event.capacity || 0) && !rsvped;
  return (
    <Card className="event-card">
      <div className="event-card-grid">
        <button onClick={onOpen} className="event-card-body">
          <div className="t-caption" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>{event.organizerName}</div>
          <div className="t-h2" style={{ textWrap: "pretty" }}>{event.title}</div>
          <div className="event-card-meta">
            <span><Icon name="calendar" size={14} color="var(--color-text-secondary)" /> {MOCK.fmtCardDateTime(event.startTime)}</span>
            <span><Icon name="map-pin" size={14} color="var(--color-text-secondary)" /> {event.venueName}</span>
            <span><Icon name="users" size={14} color="var(--color-text-secondary)" /> {event.rsvpCount} / {event.capacity}</span>
          </div>
          <div style={{ marginTop: 8 }}><Progress value={event.rsvpCount} max={event.capacity} /></div>
        </button>
        <div className="event-card-side">
          <Pill status={event.status} />
          {onToggleRsvp ? (
            <Button size="sm" variant={rsvped ? "secondary" : "primary"}
              onClick={e => { e.stopPropagation(); onToggleRsvp(event); }}
              disabled={isFull} leadingIcon={rsvped ? "check" : undefined}>
              {rsvped ? "Going" : isFull ? "Full" : "RSVP"}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

Object.assign(window, { cn, Button, IconButton, Field, Input, Textarea, Select, Card, Pill, Banner, Avatar, Progress, Segmented, EmptyState, QRPlaceholder, EventCard });

// CEMS — Component primitives + icons
// Exports to window: Icon, Button, Field, Input, Textarea, Select, Card, Pill,
// Toast, ToastStack, Modal, Skeleton, EmptyState, Banner, Progress, Avatar,
// Chips, FAB, Segmented, fmtDate, fmtDateRange, fmtTime, statusLabel

// ---- Icons (mono-line, 24×24) ----
const Icon = ({ name, size = 24, color = "currentColor", strokeWidth = 2 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":    return <svg {...p}><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>;
    case "calendar":return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>;
    case "ticket":  return <svg {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" /><path d="M14 6v12" strokeDasharray="2 2" /></svg>;
    case "user":    return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>;
    case "check":   return <svg {...p}><path d="M5 12l5 5L20 7" /></svg>;
    case "check-circle": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>;
    case "x":       return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "x-circle":return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>;
    case "alert":   return <svg {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.86a2 2 0 0 1 3.4 0l8.4 14a2 2 0 0 1-1.7 3H3.6a2 2 0 0 1-1.7-3l8.4-14z" /></svg>;
    case "alert-circle": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>;
    case "info":    return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
    case "back":    return <svg {...p}><path d="M15 18l-6-6 6-6" /></svg>;
    case "chevron-right": return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
    case "chevron-down":  return <svg {...p}><path d="M6 9l6 6 6-6" /></svg>;
    case "plus":    return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case "search":  return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
    case "calendar-empty": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M8 14h8" strokeDasharray="2 3" /></svg>;
    case "qr":      return <svg {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1" /></svg>;
    case "wifi-off":return <svg {...p}><path d="M3 9a17 17 0 0 1 18 0M6 12.5a12 12 0 0 1 12 0M9 16a7 7 0 0 1 6 0M12 19.5h.01" /><path d="M3 3l18 18" /></svg>;
    case "logout":  return <svg {...p}><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>;
    case "settings":return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9 1.7 1.7 0 0 0 4.3 7.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.4.6 1 .9 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
    case "scan":    return <svg {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M4 16v2a2 2 0 0 0 2 2h2M16 20h2a2 2 0 0 0 2-2v-2" /><path d="M4 12h16" /></svg>;
    case "clock":   return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "map-pin": return <svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "users":   return <svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3 3-5 7-5s7 2 7 5" /><circle cx="17" cy="9" r="3" /><path d="M16 16c3 0 6 1 6 5" /></svg>;
    case "megaphone": return <svg {...p}><path d="M3 11v3l11 4V7L3 11z" /><path d="M14 8a4 4 0 0 1 0 8" /></svg>;
    case "edit":    return <svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>;
    case "tag":     return <svg {...p}><path d="M20 12L12 20l-9-9V3h8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>;
    case "inbox":   return <svg {...p}><path d="M3 13l3-9h12l3 9" /><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" /><path d="M3 13h5l1 3h6l1-3h5" /></svg>;
    default: return null;
  }
};

// ---- Date helpers ----
const WEEK = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso) {
  const d = new Date(iso);
  return `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso) {
  const d = new Date(iso);
  let h = d.getHours(), m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2,"0")} ${ap}`;
}
function fmtDateRange(startIso, endIso) {
  const s = new Date(startIso), e = new Date(endIso);
  const sameDay = s.toDateString() === e.toDateString();
  const head = `${WEEK[s.getDay()]}, ${s.getDate()} ${MONTH[s.getMonth()]}`;
  if (sameDay) return `${head} · ${fmtTime(startIso)} – ${fmtTime(endIso)}`;
  return `${head} ${fmtTime(startIso)} → ${WEEK[e.getDay()]}, ${e.getDate()} ${MONTH[e.getMonth()]} ${fmtTime(endIso)}`;
}
function fmtCardDateTime(iso) {
  const d = new Date(iso);
  return `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]} · ${fmtTime(iso)}`;
}
function statusLabel(s) {
  return ({
    DRAFT: "Draft",
    PENDING_APPROVAL: "Pending approval",
    APPROVED: "Approved",
    PUBLISHED: "Published",
    ONGOING: "Live now",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  })[s] || s;
}

// ---- Button ----
const Button = ({ variant = "primary", size, loading, disabled, block, children, leadingIcon, onClick, type = "button", ...rest }) => {
  const cls = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
  ].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} disabled={disabled || loading} onClick={onClick} {...rest}>
      {loading ? <span className="btn-spinner" aria-label="Loading" /> : (
        <React.Fragment>
          {leadingIcon ? <Icon name={leadingIcon} size={18} /> : null}
          <span>{children}</span>
        </React.Fragment>
      )}
    </button>
  );
};

// ---- Field wrappers ----
const Field = ({ label, helper, error, children, htmlFor }) => (
  <div className={`field ${error ? "is-error" : ""}`}>
    {label ? <label className="field-label" htmlFor={htmlFor}>{label}</label> : null}
    {children}
    {(error || helper) ? <div className={`field-helper ${error ? "is-error" : ""}`}>{error || helper}</div> : null}
  </div>
);

const Input = ({ id, value, onChange, type = "text", placeholder, disabled, autoComplete, inputMode, ...rest }) => (
  <input id={id} className="input" value={value ?? ""} onChange={e => onChange?.(e.target.value)}
         type={type} placeholder={placeholder} disabled={disabled} autoComplete={autoComplete} inputMode={inputMode} {...rest} />
);

const Textarea = ({ id, value, onChange, placeholder, disabled, rows = 4 }) => (
  <textarea id={id} className="textarea" value={value ?? ""} rows={rows}
            onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled} />
);

const Select = ({ id, value, onChange, options, placeholder, disabled }) => (
  <div className="select-wrap">
    <select id={id} className="select" value={value ?? ""} onChange={e => onChange?.(e.target.value)} disabled={disabled}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map(o => typeof o === "string"
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ---- Pill (status) ----
const Pill = ({ status, children, dot }) => (
  <span className={`pill pill-${status}`}>
    {dot ? <span style={{width:6, height:6, borderRadius:3, background:"currentColor", display:"inline-block"}} /> : null}
    {children || statusLabel(status)}
  </span>
);

// ---- Card ----
const Card = ({ children, className = "", onClick, as: As = "div", ...rest }) => (
  <As className={`card ${className}`} onClick={onClick} {...rest}>{children}</As>
);

// ---- Skeleton ----
const Skeleton = ({ w = "100%", h = 16, r = 6, style }) => (
  <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const SkelEventCard = () => (
  <div className="card" style={{padding: 16}}>
    <div className="row-between"><Skeleton w={140} h={14} /><Skeleton w={70} h={20} r={6} /></div>
    <div className="mt-3"><Skeleton w="80%" h={20} /></div>
    <div className="mt-2"><Skeleton w="55%" h={14} /></div>
    <div className="mt-2"><Skeleton w="45%" h={14} /></div>
  </div>
);

// ---- Empty ----
const EmptyState = ({ icon = "inbox", title, action }) => (
  <div className="empty">
    <div className="empty-icon"><Icon name={icon} size={32} /></div>
    <div className="t-body" style={{color: "var(--color-text-secondary)", maxWidth: 280}}>{title}</div>
    {action ? <div>{action}</div> : null}
  </div>
);

// ---- Banner ----
const Banner = ({ kind = "info", icon, children }) => (
  <div className={`banner banner-${kind}`}>
    <Icon name={icon || (kind === "danger" ? "alert" : kind === "warning" ? "alert-circle" : kind === "success" ? "check-circle" : "info")} size={18} />
    <div style={{flex:1}}>{children}</div>
  </div>
);

// ---- Toast ----
const Toast = ({ kind = "default", icon, children }) => (
  <div className={`toast toast-${kind}`}>
    <Icon name={icon || (kind === "success" ? "check-circle" : kind === "danger" ? "alert-circle" : "info")} size={18} />
    <div style={{flex:1}}>{children}</div>
  </div>
);

const ToastStack = ({ toasts }) => (
  <div className="toast-stack" aria-live="polite">
    {toasts.map(t => <Toast key={t.id} kind={t.kind} icon={t.icon}>{t.text}</Toast>)}
  </div>
);

// ---- Modal ----
const Modal = ({ open, title, body, primaryLabel, primaryVariant = "danger", onPrimary, secondaryLabel = "Cancel", onClose }) => {
  if (!open) return null;
  return (
    <div className="modal-root" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-grabber" />
        <div className="modal-title">{title}</div>
        {body ? <div className="modal-body">{body}</div> : null}
        <div className="modal-actions">
          <Button variant={primaryVariant} block onClick={onPrimary}>{primaryLabel}</Button>
          <Button variant="ghost" block onClick={onClose}>{secondaryLabel}</Button>
        </div>
      </div>
    </div>
  );
};

// ---- Progress ----
const Progress = ({ value, max }) => (
  <div className="progress" aria-valuenow={value} aria-valuemax={max} role="progressbar">
    <div className="progress-bar" style={{ width: `${Math.min(100, (value / Math.max(max,1)) * 100)}%` }} />
  </div>
);

// ---- Avatar ----
const Avatar = ({ name, size }) => {
  const initials = (name || "?").split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
  return <div className={`avatar ${size === "lg" ? "avatar-lg" : ""}`}>{initials}</div>;
};

// ---- Chips multi-select ----
const Chips = ({ options, value = [], onChange }) => (
  <div className="chips">
    {options.map(o => {
      const v = typeof o === "string" ? o : o.value;
      const label = typeof o === "string" ? o : o.label;
      const active = value.includes(v);
      return (
        <button key={v} className="chip" aria-pressed={active}
                onClick={() => onChange(active ? value.filter(x => x !== v) : [...value, v])}>
          {label}
        </button>
      );
    })}
  </div>
);

// ---- FAB ----
const FAB = ({ onClick, label = "Create" }) => (
  <button className="fab" onClick={onClick} aria-label={label}>
    <Icon name="plus" />
  </button>
);

// ---- Segmented ----
const Segmented = ({ options, value, onChange }) => (
  <div className="segmented" role="tablist">
    {options.map(o => {
      const v = typeof o === "string" ? o : o.value;
      const label = typeof o === "string" ? o : o.label;
      return (
        <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}>{label}</button>
      );
    })}
  </div>
);

// ---- Stylized QR placeholder (no real lib) ----
const QRPlaceholder = ({ seed = "abc", size = 256 }) => {
  // Deterministic 21x21 module grid
  const N = 21;
  const cells = [];
  // FNV-1a hash
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  let r = h >>> 0;
  const next = () => { r ^= r << 13; r ^= r >>> 17; r ^= r << 5; r >>>= 0; return r / 0xffffffff; };
  const isFinder = (x, y) => (
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7)
  );
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (isFinder(x, y)) continue;
      if (next() < 0.5) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0F172A" />);
    }
  }
  // Finder pattern (corner squares)
  const finder = (ox, oy) => (
    <React.Fragment>
      <rect x={ox} y={oy} width={7} height={7} fill="#0F172A" />
      <rect x={ox + 1} y={oy + 1} width={5} height={5} fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width={3} height={3} fill="#0F172A" />
    </React.Fragment>
  );
  return (
    <svg className="qr-svg" viewBox={`0 0 ${N} ${N}`} width="100%" height="100%" shapeRendering="crispEdges" role="img" aria-label="QR code">
      <rect width={N} height={N} fill="#fff" />
      {cells}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
};

Object.assign(window, {
  Icon, Button, Field, Input, Textarea, Select,
  Pill, Card, Skeleton, SkelEventCard, EmptyState, Banner,
  Toast, ToastStack, Modal, Progress, Avatar, Chips, FAB, Segmented,
  QRPlaceholder,
  fmtDate, fmtTime, fmtDateRange, fmtCardDateTime, statusLabel,
});

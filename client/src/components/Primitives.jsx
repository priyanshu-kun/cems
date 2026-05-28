import { Icon } from "./Icon.jsx";
import { classNames, initials, statusLabel } from "../utils/format.js";

export function Card({ children, className = "", onClick, as: As = "div", ...rest }) {
  return (
    <As className={classNames("card", className)} onClick={onClick} {...rest}>
      {children}
    </As>
  );
}

export function Pill({ status, children, tone }) {
  return (
    <span className={classNames("pill", status ? `pill-${status}` : tone && `pill-tone-${tone}`)}>
      {children || statusLabel(status)}
    </span>
  );
}

export function Banner({ kind = "info", icon, children }) {
  const iconName = icon || (kind === "danger" ? "alert" : kind === "warning" ? "alert-circle" : kind === "success" ? "check-circle" : "info");
  return (
    <div className={`banner banner-${kind}`}>
      <Icon name={iconName} size={18} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export function Skeleton({ w = "100%", h = 16, r = 6, style }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function SkelEventCard() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row-between"><Skeleton w={140} h={14} /><Skeleton w={70} h={20} r={6} /></div>
      <div style={{ marginTop: 12 }}><Skeleton w="80%" h={20} /></div>
      <div style={{ marginTop: 8 }}><Skeleton w="55%" h={14} /></div>
      <div style={{ marginTop: 8 }}><Skeleton w="45%" h={14} /></div>
    </div>
  );
}

export function EmptyState({ icon = "inbox", title, body, action }) {
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

export function Progress({ value, max }) {
  const pct = Math.min(100, (Number(value) / Math.max(Number(max), 1)) * 100);
  return (
    <div className="progress" aria-valuenow={value} aria-valuemax={max} role="progressbar">
      <div className="progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Avatar({ name, size }) {
  return <div className={classNames("avatar", size === "lg" && "avatar-lg")}>{initials(name)}</div>;
}

export function Spinner({ size = 20 }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-label="Loading" />;
}

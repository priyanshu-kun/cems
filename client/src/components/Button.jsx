import { Icon } from "./Icon.jsx";
import { classNames } from "../utils/format.js";

export function Button({
  variant = "primary",
  size,
  loading,
  disabled,
  block,
  children,
  leadingIcon,
  trailingIcon,
  onClick,
  type = "button",
  className,
  ...rest
}) {
  const cls = classNames(
    "btn",
    `btn-${variant}`,
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg",
    block && "btn-block",
    className
  );
  return (
    <button type={type} className={cls} disabled={disabled || loading} onClick={onClick} {...rest}>
      {loading ? (
        <span className="btn-spinner" aria-label="Loading" />
      ) : (
        <>
          {leadingIcon ? <Icon name={leadingIcon} size={size === "sm" ? 16 : 18} /> : null}
          <span>{children}</span>
          {trailingIcon ? <Icon name={trailingIcon} size={size === "sm" ? 16 : 18} /> : null}
        </>
      )}
    </button>
  );
}

export function IconButton({ icon, label, onClick, variant = "ghost", size = 36, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={classNames("icon-btn", `icon-btn-${variant}`, className)}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} />
    </button>
  );
}

// Date / status formatting helpers.

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}`;
}
export function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
export function fmtDateRange(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  const s = new Date(startIso), e = new Date(endIso);
  const sameDay = s.toDateString() === e.toDateString();
  const head = `${WEEK[s.getDay()]}, ${s.getDate()} ${MONTH[s.getMonth()]}`;
  if (sameDay) return `${head} · ${fmtTime(startIso)} – ${fmtTime(endIso)}`;
  return `${head} ${fmtTime(startIso)} → ${WEEK[e.getDay()]}, ${e.getDate()} ${MONTH[e.getMonth()]} ${fmtTime(endIso)}`;
}
export function fmtCardDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]} · ${fmtTime(iso)}`;
}

// For datetime-local inputs (YYYY-MM-DDTHH:mm)
export function toDateTimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const STATUS_LABEL = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  ONGOING: "Live now",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
export function statusLabel(s) { return STATUS_LABEL[s] || s; }

export function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
}

export function classNames(...xs) { return xs.filter(Boolean).join(" "); }

// Friendly error message extraction.
export function errorMessage(e, fallback = "Something went wrong.") {
  if (!e) return fallback;
  if (e.code === "VALIDATION_ERROR" && e.details) {
    const first = Object.values(e.details)[0];
    if (first) return first;
  }
  return e.message || fallback;
}

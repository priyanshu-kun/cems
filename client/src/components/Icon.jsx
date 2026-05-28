// Mono-line 24×24 icon set.
export function Icon({ name, size = 24, color = "currentColor", strokeWidth = 2, className }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
    className,
  };
  switch (name) {
    case "home": return <svg {...p}><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>;
    case "calendar-empty": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M8 14h8" strokeDasharray="2 3" /></svg>;
    case "ticket": return <svg {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" /><path d="M14 6v12" strokeDasharray="2 2" /></svg>;
    case "user": return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>;
    case "users": return <svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2 21c0-3 3-5 7-5s7 2 7 5" /><circle cx="17" cy="9" r="3" /><path d="M16 16c3 0 6 1 6 5" /></svg>;
    case "check": return <svg {...p}><path d="M5 12l5 5L20 7" /></svg>;
    case "check-circle": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>;
    case "x": return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "x-circle": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></svg>;
    case "alert": return <svg {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.86a2 2 0 0 1 3.4 0l8.4 14a2 2 0 0 1-1.7 3H3.6a2 2 0 0 1-1.7-3l8.4-14z" /></svg>;
    case "alert-circle": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>;
    case "info": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
    case "back": return <svg {...p}><path d="M15 18l-6-6 6-6" /></svg>;
    case "chevron-right": return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
    case "chevron-down": return <svg {...p}><path d="M6 9l6 6 6-6" /></svg>;
    case "plus": return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case "minus": return <svg {...p}><path d="M5 12h14" /></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
    case "qr": return <svg {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v1" /></svg>;
    case "logout": return <svg {...p}><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>;
    case "scan": return <svg {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M4 16v2a2 2 0 0 0 2 2h2M16 20h2a2 2 0 0 0 2-2v-2" /><path d="M4 12h16" /></svg>;
    case "clock": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "map-pin": return <svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "megaphone": return <svg {...p}><path d="M3 11v3l11 4V7L3 11z" /><path d="M14 8a4 4 0 0 1 0 8" /></svg>;
    case "tag": return <svg {...p}><path d="M20 12L12 20l-9-9V3h8z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>;
    case "inbox": return <svg {...p}><path d="M3 13l3-9h12l3 9" /><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" /><path d="M3 13h5l1 3h6l1-3h5" /></svg>;
    case "package": return <svg {...p}><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>;
    case "menu": return <svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
    case "shield": return <svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /></svg>;
    case "edit": return <svg {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>;
    default: return null;
  }
}

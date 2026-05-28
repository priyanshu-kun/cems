import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import { Avatar } from "./Primitives.jsx";
import { IconButton } from "./Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import config from "../config.js";
import { classNames } from "../utils/format.js";

const NAV = {
  STUDENT: [
    { to: "/home", label: "Home", icon: "home" },
    { to: "/events", label: "Browse", icon: "calendar" },
    { to: "/my-events", label: "My Events", icon: "ticket" },
    { to: "/my-pass", label: "My Pass", icon: "qr" },
    { to: "/profile", label: "Profile", icon: "user" },
  ],
  ORGANIZER: [
    { to: "/home", label: "Home", icon: "home" },
    { to: "/events", label: "Browse", icon: "calendar" },
    { to: "/my-events", label: "My Events", icon: "ticket" },
    { to: "/create-event", label: "New event", icon: "plus" },
    { to: "/my-pass", label: "My Pass", icon: "qr" },
    { to: "/profile", label: "Profile", icon: "user" },
  ],
  ADMIN: [
    { to: "/home", label: "Dashboard", icon: "home" },
    { to: "/approvals", label: "Approvals", icon: "inbox" },
    { to: "/events", label: "All events", icon: "calendar" },
    { to: "/scanner", label: "Scanner", icon: "scan" },
    { to: "/assets", label: "Assets", icon: "package" },
    { to: "/profile", label: "Profile", icon: "user" },
  ],
};

export function AppLayout() {
  const { user, effectiveRole, logout } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(() => NAV[effectiveRole] || NAV.STUDENT, [effectiveRole]);

  const confirmLogout = () => {
    openModal({
      title: `Sign out of ${config.appName}?`,
      primaryLabel: "Sign out",
      primaryVariant: "danger",
      onPrimary: () => { logout(); navigate("/login", { replace: true }); },
    });
  };

  return (
    <div className="app">
      {/* ---- Sidebar (desktop) ---- */}
      <aside className={classNames("sidebar", mobileOpen && "is-open")} aria-label="Primary navigation">
        <div className="sidebar-brand">
          <div className="brand-mark">{config.brandInitial}</div>
          <div>
            <div className="brand-name">{config.appName}</div>
            <div className="brand-sub">{config.collegeName}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) => classNames("nav-link", isActive && "is-active")}
              onClick={() => setMobileOpen(false)}
            >
              <Icon name={it.icon} size={20} />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <Avatar name={user?.fullName || user?.name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-strong truncate">{user?.fullName || user?.name || "Account"}</div>
            <div className="t-caption truncate">{(user?.roles || []).join(" · ").toLowerCase() || "—"}</div>
          </div>
          <IconButton icon="logout" label="Sign out" onClick={confirmLogout} />
        </div>
      </aside>

      {mobileOpen ? <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} /> : null}

      {/* ---- Main column ---- */}
      <div className="main">
        <header className="topbar">
          <IconButton icon="menu" label="Open menu" className="show-mobile" onClick={() => setMobileOpen(true)} />
          <PageTitle pathname={location.pathname} items={items} />
          <div className="topbar-right">
            <div className="role-chip" title={(user?.roles || []).join(", ")}>{effectiveRole.toLowerCase()}</div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        {/* Mobile bottom tab bar mirrors first few sidebar items */}
        <nav className="tabbar" aria-label="Mobile navigation">
          {items.slice(0, 5).map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => classNames("tab", isActive && "is-active")}>
              <Icon name={it.icon} size={22} />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function PageTitle({ pathname, items }) {
  const match = items.find((i) => pathname.startsWith(i.to));
  const fallback = pathname.replace(/^\//, "").replace(/-/g, " ") || "Home";
  const title = match ? match.label : fallback;
  return <h1 className="page-title">{title.charAt(0).toUpperCase() + title.slice(1)}</h1>;
}

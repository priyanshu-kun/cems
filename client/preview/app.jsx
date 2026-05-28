// Preview root — sidebar layout + state-based routing + role switching.
const {
  Icon, Avatar, IconButton, MOCK,
  LoginScreen, HomeScreen, EventsScreen, EventDetailScreen,
  MyEventsScreen, MyPassScreen, ScannerScreen, ApprovalsScreen, ProfileScreen,
} = window;

const NAV = {
  STUDENT: [
    { key: "home",       label: "Home",       icon: "home" },
    { key: "events",     label: "Browse",     icon: "calendar" },
    { key: "my-events",  label: "My Events",  icon: "ticket" },
    { key: "my-pass",    label: "My Pass",    icon: "qr" },
    { key: "profile",    label: "Profile",    icon: "user" },
  ],
  ORGANIZER: [
    { key: "home",       label: "Home",       icon: "home" },
    { key: "events",     label: "Browse",     icon: "calendar" },
    { key: "my-events",  label: "My Events",  icon: "ticket" },
    { key: "create",     label: "New event",  icon: "plus" },
    { key: "my-pass",    label: "My Pass",    icon: "qr" },
    { key: "profile",    label: "Profile",    icon: "user" },
  ],
  ADMIN: [
    { key: "home",       label: "Dashboard",  icon: "home" },
    { key: "approvals",  label: "Approvals",  icon: "inbox" },
    { key: "events",     label: "All events", icon: "calendar" },
    { key: "scanner",    label: "Scanner",    icon: "scan" },
    { key: "profile",    label: "Profile",    icon: "user" },
  ],
};

function App() {
  const [signedIn, setSignedIn] = React.useState(false);
  const [role, setRole] = React.useState("STUDENT");
  const [route, setRoute] = React.useState({ name: "home" });
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [events, setEvents] = React.useState(MOCK.events);
  const [rsvps, setRsvps] = React.useState(() => new Set(["e1", "e3"]));

  const user = MOCK.users[role];
  const items = NAV[role];

  const navigate = (r) => { setRoute(r); setMobileOpen(false); };

  const toggleRsvp = (ev) => {
    setRsvps(prev => {
      const next = new Set(prev);
      if (next.has(ev._id)) {
        next.delete(ev._id);
        setEvents(es => es.map(x => x._id === ev._id ? { ...x, rsvpCount: x.rsvpCount - 1 } : x));
      } else {
        next.add(ev._id);
        setEvents(es => es.map(x => x._id === ev._id ? { ...x, rsvpCount: x.rsvpCount + 1 } : x));
      }
      return next;
    });
  };

  const removeEventFromQueue = (id) => {
    setEvents(es => es.map(e => e._id === id ? { ...e, status: "APPROVED" } : e));
  };

  const ctx = {
    user, role, events, rsvps, navigate, toggleRsvp, removeEventFromQueue,
    announcements: MOCK.announcements,
    signOut: () => { setSignedIn(false); setRoute({ name: "home" }); },
  };

  if (!signedIn) {
    return <LoginScreen onSignIn={(r) => { setRole(r); setSignedIn(true); setRoute({ name: "home" }); }} />;
  }

  let body = null;
  if (route.name === "home")      body = <HomeScreen ctx={ctx} />;
  else if (route.name === "events")    body = <EventsScreen ctx={ctx} />;
  else if (route.name === "event")     body = <EventDetailScreen ctx={ctx} eventId={route.id} />;
  else if (route.name === "my-events") body = <MyEventsScreen ctx={ctx} />;
  else if (route.name === "my-pass")   body = <MyPassScreen ctx={ctx} />;
  else if (route.name === "scanner")   body = <ScannerScreen />;
  else if (route.name === "approvals") body = <ApprovalsScreen ctx={ctx} />;
  else if (route.name === "profile")   body = <ProfileScreen ctx={ctx} />;
  else if (route.name === "create")    body = (
    <div className="col gap-4">
      <h1 className="t-display" style={{ margin: 0 }}>New event</h1>
      <div className="t-small">Full form is implemented in <code>src/pages/CreateEventPage.jsx</code> and connects to <code>POST /events</code>.</div>
    </div>
  );

  const pageTitle = (items.find(i => i.key === route.name) || {}).label
    || (route.name === "event" ? "Event" : route.name);

  return (
    <div className="app">
      <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">{MOCK.brandInitial}</div>
          <div>
            <div className="brand-name">{MOCK.appName}</div>
            <div className="brand-sub">{MOCK.collegeName}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {items.map(it => (
            <button
              key={it.key}
              className={`nav-link ${route.name === it.key ? "is-active" : ""}`}
              onClick={() => navigate({ name: it.key })}
              style={{ background: route.name === it.key ? undefined : "transparent", border: 0, font: "inherit", textAlign: "left", cursor: "pointer", width: "100%" }}
            >
              <Icon name={it.icon} size={20} />
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <Avatar name={user.fullName} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-strong truncate">{user.fullName}</div>
            <div className="t-caption truncate">{user.roles.join(" · ").toLowerCase()}</div>
          </div>
          <IconButton icon="logout" label="Sign out" onClick={ctx.signOut} />
        </div>
      </aside>

      {mobileOpen ? <div className="sidebar-scrim" onClick={() => setMobileOpen(false)} /> : null}

      <div className="main">
        <header className="topbar">
          <IconButton icon="menu" label="Open menu" className="show-mobile" onClick={() => setMobileOpen(true)} />
          <h1 className="page-title">{(pageTitle || "Home").toString().charAt(0).toUpperCase() + (pageTitle || "Home").toString().slice(1)}</h1>
          <div className="topbar-right">
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setRoute({ name: "home" }); }}
              className="role-chip"
              style={{ border: 0, paddingRight: 24, cursor: "pointer", appearance: "none" }}
              title="Switch role (preview only)"
            >
              <option value="STUDENT">student</option>
              <option value="ORGANIZER">organizer</option>
              <option value="ADMIN">admin</option>
            </select>
          </div>
        </header>

        <main className="content">{body}</main>

        <nav className="tabbar">
          {items.slice(0, 5).map(it => (
            <button key={it.key}
              className={`tab ${route.name === it.key ? "is-active" : ""}`}
              onClick={() => navigate({ name: it.key })}
              style={{ background: "transparent", border: 0, cursor: "pointer", font: "inherit" }}>
              <Icon name={it.icon} size={22} />
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// CEMS — Root app: role switching, navigation, tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "role": "STUDENT",
  "screenState": "default",
  "showSignedOut": false
}/*EDITMODE-END*/;

const ROLE_TABS = {
  STUDENT: [
    { key: "home",       label: "Home",       icon: "home" },
    { key: "my-events",  label: "My Events",  icon: "calendar" },
    { key: "my-pass",    label: "My Pass",    icon: "ticket" },
    { key: "profile",    label: "Profile",    icon: "user" },
  ],
  ORGANIZER: [
    { key: "home",       label: "Home",       icon: "home" },
    { key: "my-events",  label: "My Events",  icon: "calendar" },
    { key: "my-pass",    label: "My Pass",    icon: "ticket" },
    { key: "profile",    label: "Profile",    icon: "user" },
  ],
  ADMIN: [
    { key: "approvals",  label: "Approvals",  icon: "inbox" },
    { key: "events",     label: "Events",     icon: "calendar" },
    { key: "scanner",    label: "Scanner",    icon: "scan" },
    { key: "profile",    label: "Profile",    icon: "user" },
  ],
};

const ROLE_LABEL = { STUDENT: "Student", ORGANIZER: "Organizer", ADMIN: "Admin" };

const SCREEN_TITLE = {
  "home": "Home",
  "my-events": "My Events",
  "my-pass": "My Pass",
  "profile": "Profile",
  "approvals": "Approvals",
  "events": "Events",
  "scanner": "Scanner",
  "event-detail": "Event",
  "create-event": "Create event",
  "create-announcement": "New announcement",
  "assets": "Assets",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const role = t.role || "STUDENT";

  // Data state
  const D = window.CEMS_DATA;
  const [events, setEvents] = React.useState(D.events);
  const [announcements, setAnnouncements] = React.useState(D.announcements);
  const [rsvps, setRsvps] = React.useState(D.initialRsvps);

  // Auth
  const [signedOut, setSignedOut] = React.useState(false);
  const [authScreen, setAuthScreen] = React.useState("login");

  React.useEffect(() => { if (t.showSignedOut) setSignedOut(true); }, [t.showSignedOut]);

  // Navigation: tab + stack (pushed screens)
  const tabs = ROLE_TABS[role];
  const [tab, setTab] = React.useState(tabs[0].key);
  const [stack, setStack] = React.useState([]); // [{type, ...}]

  // When role changes, reset tab & stack
  const lastRoleRef = React.useRef(role);
  React.useEffect(() => {
    if (lastRoleRef.current !== role) {
      lastRoleRef.current = role;
      setTab(ROLE_TABS[role][0].key);
      setStack([]);
    }
  }, [role]);

  // Current user
  const user = role === "STUDENT" ? D.users.student
              : role === "ORGANIZER" ? D.users.organizer
              : D.users.admin;

  // Toasts
  const [toasts, setToasts] = React.useState([]);
  const toast = React.useCallback((toastObj) => {
    const id = "t_" + Math.random().toString(36).slice(2,7);
    setToasts(arr => [...arr, { id, kind:"default", ...toastObj }].slice(-3));
    setTimeout(() => setToasts(arr => arr.filter(x => x.id !== id)), 4000);
  }, []);

  // Confirmation modal
  const [modal, setModal] = React.useState(null);
  const openModal = (m) => setModal(m);
  const closeModal = () => setModal(null);

  const toggleRsvp = (eventId) => {
    setRsvps(arr => arr.includes(eventId) ? arr.filter(x => x !== eventId) : [...arr, eventId]);
    setEvents(evs => evs.map(e => {
      if (e.id !== eventId) return e;
      const rsvped = rsvps.includes(eventId);
      return { ...e, rsvpCount: e.rsvpCount + (rsvped ? -1 : 1) };
    }));
  };

  const push = (screen) => setStack(s => [...s, screen]);
  const pop = () => setStack(s => s.slice(0, -1));
  const goToTab = (k) => { setStack([]); setTab(k); };

  const signOut = () => { closeModal(); setSignedOut(true); setAuthScreen("login"); };
  const signIn = (toScreen) => { if (toScreen === "register") { setAuthScreen("register"); return; } setSignedOut(false); setAuthScreen("login"); };

  const ctx = {
    data: { ...D, events, announcements },
    user, role,
    rsvps, toggleRsvp,
    push, pop, goToTab,
    toast, openModal, closeModal,
    setEvents, setAnnouncements,
    signOut,
    openCreateAnnouncement: () => push({type: "create-announcement"}),
  };

  // ----- Auth flow -----
  if (signedOut) {
    return (
      <div className="frame">
        {authScreen === "login"
          ? <LoginScreen onSignedIn={signIn} demoState={t.screenState} />
          : <RegisterScreen onSignedIn={() => signIn()} onBack={() => setAuthScreen("login")} demoState={t.screenState} />}
        {renderTweaks(t, setTweak)}
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  // ----- Top screen -----
  const top = stack[stack.length - 1];
  const screenType = top ? top.type : tab;

  // Title bar config
  let titleBar = null;
  let body = null;
  let onBack = top ? pop : null;

  if (top) {
    titleBar = (
      <div className="topbar">
        <button className="topbar-back" onClick={onBack} aria-label="Back"><Icon name="back" /></button>
        <div className="topbar-title">{SCREEN_TITLE[top.type] || ""}</div>
      </div>
    );
    if (top.type === "event-detail") body = <EventDetailScreen ctx={ctx} eventId={top.id} demoState={t.screenState} />;
    else if (top.type === "create-event") body = <CreateEventScreen ctx={ctx} demoState={t.screenState} />;
    else if (top.type === "create-announcement") body = <CreateAnnouncementScreen ctx={ctx} />;
    else if (top.type === "assets") body = <AssetsScreen ctx={ctx} />;
  } else {
    titleBar = (
      <div className="topbar">
        <div className="row gap-2">
          <div className="auth-brand-mark" style={{width:28, height:28, borderRadius:8, fontSize:13}}>C</div>
          <div className="t-strong" style={{fontSize:15}}>CEMS</div>
        </div>
        <div style={{marginLeft:"auto"}} className="t-caption">{ROLE_LABEL[role]}</div>
      </div>
    );
    if (tab === "home")      body = <HomeScreen ctx={ctx} demoState={t.screenState} />;
    if (tab === "my-events") body = <MyEventsScreen ctx={ctx} demoState={t.screenState} />;
    if (tab === "my-pass")   body = <MyPassScreen ctx={ctx} demoState={t.screenState} />;
    if (tab === "profile")   body = <ProfileScreen ctx={ctx} demoState={t.screenState} />;
    if (tab === "approvals") body = <ApprovalsScreen ctx={ctx} demoState={t.screenState} />;
    if (tab === "events")    body = <AdminEventsScreen ctx={ctx} demoState={t.screenState} />;
    if (tab === "scanner")   body = <ScannerScreen ctx={ctx} demoState={t.screenState} />;
  }

  const hideTabbar = top && (top.type === "create-event" || top.type === "create-announcement");

  return (
    <div className="frame">
      {titleBar}
      {body}
      {!hideTabbar && (
        <div className="tabbar" role="tablist">
          {tabs.map(tb => (
            <button key={tb.key} className="tab" role="tab"
                    aria-current={!top && tab === tb.key ? "page" : undefined}
                    onClick={() => goToTab(tb.key)}>
              <Icon name={tb.icon} size={22} color={(!top && tab === tb.key) ? "var(--color-primary)" : "var(--color-text-secondary)"} strokeWidth={!top && tab === tb.key ? 2.4 : 2} />
              <span>{tb.label}</span>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!modal} {...(modal || {})}
             onPrimary={() => { const fn = modal?.onPrimary; closeModal(); fn && fn(); }}
             onClose={closeModal} />

      <ToastStack toasts={toasts} />

      {renderTweaks(t, setTweak, { signOut: () => setSignedOut(true) })}
    </div>
  );
}

function renderTweaks(t, setTweak, extra = {}) {
  return (
    <TweaksPanel>
      <TweakSection label="Role" />
      <TweakRadio label="View as"
                  value={t.role}
                  options={[
                    { value: "STUDENT", label: "Student" },
                    { value: "ORGANIZER", label: "Organizer" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                  onChange={v => setTweak("role", v)} />

      <TweakSection label="Screen state" />
      <TweakSelect label="Demo state"
                   value={t.screenState}
                   options={[
                     { value: "default",  label: "Default" },
                     { value: "loading",  label: "Loading (skeletons)" },
                     { value: "empty",    label: "Empty" },
                     { value: "error",    label: "Error" },
                     { value: "success",  label: "Success (scanner only)" },
                     { value: "used",     label: "Already used (scanner only)" },
                     { value: "expired",  label: "Expired (pass only)" },
                   ]}
                   onChange={v => setTweak("screenState", v)} />

      <TweakSection label="Auth" />
      {extra.signOut ? (
        <TweakButton label="Show login screen" onClick={extra.signOut} />
      ) : null}
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

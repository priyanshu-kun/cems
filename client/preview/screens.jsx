// Preview screens — mirror the visual design of the real pages with mock data.
const { Icon, Button, IconButton, Field, Input, Textarea, Select, Card, Pill, Banner, Avatar, Progress, Segmented, EmptyState, QRPlaceholder, EventCard, MOCK } = window;

// ---- Login ------------------------------------------------------------------
function LoginScreen({ onSignIn }) {
  const [email, setEmail] = React.useState("aarav.s22@glauniversity.in");
  const [password, setPassword] = React.useState("password123");
  const [role, setRole] = React.useState("STUDENT");
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setTimeout(() => { setLoading(false); onSignIn(role); }, 500);
  };

  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <div className="auth-form-brand">
          <div className="auth-hero-mark">{MOCK.brandInitial}</div>
          <div>
            <div className="t-h1" style={{ color: "#fff" }}>{MOCK.appName}</div>
            <div className="t-small" style={{ color: "rgba(255,255,255,0.7)" }}>{MOCK.collegeName}</div>
          </div>
        </div>
        <div style={{ maxWidth: 480 }}>
          <h2 style={{ fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            One place for every event on campus.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, lineHeight: "24px", color: "rgba(255,255,255,0.85)" }}>
            Discover what's happening, RSVP in seconds, and walk in with a verified pass.
          </p>
        </div>
        <div className="t-caption" style={{ color: "rgba(255,255,255,0.6)" }}>
          College Event Management System
        </div>
      </aside>

      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-form-brand" style={{ marginBottom: 8 }}>
            <div className="brand-mark">{MOCK.brandInitial}</div>
            <div>
              <div className="t-strong">{MOCK.appName}</div>
              <div className="t-small">{MOCK.collegeName}</div>
            </div>
          </div>
          <div>
            <h1 className="t-display" style={{ margin: 0 }}>Sign in</h1>
            <p className="t-small" style={{ marginTop: 4 }}>Use your college email and password.</p>
          </div>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={setEmail} placeholder="name@college.edu" disabled={loading} />
          </Field>
          <Field label="Password" htmlFor="pw">
            <Input id="pw" type="password" value={password} onChange={setPassword} disabled={loading} />
          </Field>

          <Field label="Preview as (demo only)">
            <Segmented
              options={[
                { value: "STUDENT", label: "Student" },
                { value: "ORGANIZER", label: "Organizer" },
                { value: "ADMIN", label: "Admin" },
              ]}
              value={role}
              onChange={setRole}
            />
          </Field>

          <Banner kind="info">
            This is the design preview with mocked data. Pick a role and sign in to see that view of the app.
          </Banner>

          <Button variant="primary" size="lg" block loading={loading} type="submit">Sign in</Button>
          <div style={{ textAlign: "center" }} className="t-small">
            Don't have an account?{" "}
            <a href="#" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
               onClick={e => e.preventDefault()}>Sign up</a>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Home -------------------------------------------------------------------
function HomeScreen({ ctx }) {
  const { user, role, events, announcements, rsvps, toggleRsvp, navigate } = ctx;
  const firstName = user.fullName.split(" ")[0];
  const upcoming = events.filter(e => e.status === "PUBLISHED");

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Hi, {firstName}</h1>
          <div className="t-small">Here's what's happening on campus.</div>
        </div>
        <div className="page-header-actions">
          {role !== "STUDENT" ? <Button variant="secondary" leadingIcon="megaphone">New announcement</Button> : null}
          {role !== "STUDENT" ? <Button variant="primary" leadingIcon="plus">Create event</Button> : null}
        </div>
      </header>

      <section>
        <div className="section-head"><h2>Announcements</h2></div>
        <div className="announce-rail">
          {announcements.slice(0, 4).map(a => (
            <button key={a._id} className="announce-card"
                    onClick={() => a.eventId && navigate({ name: "event", id: a.eventId })}>
              <div className="t-caption" style={{ color: "var(--color-primary)" }}>{a.authorName}</div>
              <div className="t-strong" style={{ textWrap: "pretty" }}>{a.title}</div>
              <div className="t-small" style={{ textWrap: "pretty" }}>{a.body}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head"><h2>Upcoming events</h2></div>
        <div className="grid-events">
          {upcoming.map(ev => (
            <EventCard key={ev._id} event={ev} rsvped={rsvps.has(ev._id)}
                       onToggleRsvp={toggleRsvp}
                       onOpen={() => navigate({ name: "event", id: ev._id })} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---- Events list ------------------------------------------------------------
function EventsScreen({ ctx }) {
  const { events, rsvps, toggleRsvp, role, navigate } = ctx;
  const [status, setStatus] = React.useState("PUBLISHED");
  const filters = [
    { value: "PUBLISHED", label: "Published" },
    { value: "ONGOING", label: "Live" },
    { value: "APPROVED", label: "Approved" },
    { value: "COMPLETED", label: "Past" },
  ];
  const list = events.filter(e => e.status === status);

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Browse events</h1>
          <div className="t-small">Find something to go to this week.</div>
        </div>
        <Segmented options={filters} value={status} onChange={setStatus} />
      </header>
      {list.length === 0 ? (
        <EmptyState icon="calendar-empty" title="No events here" body="Try a different filter." />
      ) : (
        <div className="grid-events">
          {list.map(ev => (
            <EventCard key={ev._id} event={ev} rsvped={rsvps.has(ev._id)}
                       onToggleRsvp={role !== "ADMIN" ? toggleRsvp : null}
                       onOpen={() => navigate({ name: "event", id: ev._id })} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Event detail -----------------------------------------------------------
function EventDetailScreen({ ctx, eventId }) {
  const { events, rsvps, toggleRsvp, role, navigate } = ctx;
  const event = events.find(e => e._id === eventId);
  if (!event) return null;
  const rsvped = rsvps.has(event._id);
  const isFull = event.rsvpCount >= event.capacity && !rsvped;
  const inactive = !["APPROVED", "PUBLISHED", "ONGOING"].includes(event.status);

  return (
    <div className="col gap-6">
      <div className="row gap-2">
        <IconButton icon="back" label="Back" onClick={() => navigate({ name: "home" })} />
        <div className="t-strong">Event details</div>
      </div>

      <div className="col gap-4">
        <div className="row gap-2"><Pill status={event.status} /></div>
        <h1 className="t-display" style={{ margin: 0, textWrap: "pretty" }}>{event.title}</h1>
        <div className="col gap-2">
          <div className="row gap-2 t-small"><Icon name="calendar" size={16} color="var(--color-text-secondary)" /><span>{MOCK.fmtDateRange(event.startTime, event.endTime)}</span></div>
          <div className="row gap-2 t-small"><Icon name="map-pin" size={16} color="var(--color-text-secondary)" /><span>{event.venueName}</span></div>
          <div className="row gap-2 t-small"><Icon name="users" size={16} color="var(--color-text-secondary)" /><span>{event.rsvpCount} of {event.capacity} going</span></div>
        </div>
        <Progress value={event.rsvpCount} max={event.capacity} />
      </div>

      <Card>
        <div className="t-strong">About this event</div>
        <p className="t-body" style={{ marginTop: 8, textWrap: "pretty" }}>{event.description}</p>
        {event.tags && event.tags.length ? (
          <div className="chips" style={{ marginTop: 12 }}>
            {event.tags.map(t => <span key={t} className="chip chip-static chip-tag">#{t}</span>)}
          </div>
        ) : null}
      </Card>

      {!inactive ? (
        rsvped ? (
          <div className="col gap-2">
            <Button variant="secondary" leadingIcon="check" onClick={() => toggleRsvp(event)}>You're going · Cancel RSVP</Button>
            <Banner kind="info" icon="ticket">Your gate pass is ready in the My Pass tab.</Banner>
          </div>
        ) : isFull ? (
          <Button variant="primary" disabled>Event is full</Button>
        ) : (
          <Button variant="primary" size="lg" onClick={() => toggleRsvp(event)}>RSVP to this event</Button>
        )
      ) : null}

      {role === "ADMIN" ? (
        <Card>
          <div className="t-strong">Admin actions</div>
          <div className="col gap-2 mt-3">
            {event.status === "PENDING_APPROVAL" ? <Button variant="primary">Approve event</Button> : null}
            {event.status === "APPROVED" ? <Button variant="primary">Publish event</Button> : null}
            <Button variant="danger">Cancel event</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

// ---- My events --------------------------------------------------------------
function MyEventsScreen({ ctx }) {
  const { events, rsvps, role, navigate } = ctx;
  const [tab, setTab] = React.useState("upcoming");
  const tabs = role === "STUDENT"
    ? [{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }]
    : [{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }, { value: "mine", label: "Mine" }];

  const myEvents = events.filter(e => rsvps.has(e._id));
  const list = tab === "mine"
    ? events
    : tab === "past"
    ? myEvents.filter(e => new Date(e.endTime).getTime() < Date.now())
    : myEvents.filter(e => new Date(e.endTime).getTime() >= Date.now());

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>My events</h1>
          <div className="t-small">Everything you've RSVPed to.</div>
        </div>
        <Segmented options={tabs} value={tab} onChange={setTab} />
      </header>
      {list.length === 0 ? (
        <EmptyState icon="calendar-empty" title="You haven't RSVPed to anything yet."
          action={<Button variant="secondary" onClick={() => navigate({ name: "events" })}>Browse events</Button>} />
      ) : (
        <div className="grid-events">
          {list.map(ev => (
            <EventCard key={ev._id} event={ev} rsvped={rsvps.has(ev._id)}
              onOpen={() => navigate({ name: "event", id: ev._id })} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- My pass ----------------------------------------------------------------
function MyPassScreen({ ctx }) {
  const { events, rsvps, navigate } = ctx;
  const passEntries = events.filter(e => rsvps.has(e._id) && MOCK.passes[e._id])
    .map(e => ({ event: e, ...MOCK.passes[e._id] }));
  const [idx, setIdx] = React.useState(0);

  if (passEntries.length === 0) {
    return (
      <div className="col gap-4">
        <h1 className="t-display" style={{ margin: 0 }}>My pass</h1>
        <EmptyState icon="ticket" title="No active passes" body="RSVP to an event to get a pass."
          action={<Button variant="secondary" onClick={() => navigate({ name: "events" })}>Browse events</Button>} />
      </div>
    );
  }
  const cur = passEntries[Math.min(idx, passEntries.length - 1)];

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>My pass</h1>
          <div className="t-small">Show this at the gate. Don't share the QR code.</div>
        </div>
      </header>
      <div className="pass-card">
        <div className="pass-info">
          <div className="t-strong" style={{ textWrap: "pretty", fontSize: 18 }}>{cur.event.title}</div>
          <div className="t-small">{MOCK.fmtCardDateTime(cur.event.startTime)}</div>
          <div className="t-small">{cur.event.venueName}</div>
          <div className="row gap-6 mt-3" style={{ flexWrap: "wrap" }}>
            <div className="col gap-1">
              <div className="t-caption">Pass ID</div>
              <div className="t-small" style={{ fontFamily: "ui-monospace, monospace", color: "var(--color-text)" }}>{cur.pass.passId}</div>
            </div>
            <div className="col gap-1">
              <div className="t-caption">Valid until</div>
              <div className="t-small">{MOCK.fmtTime(cur.pass.expiresAt)}</div>
            </div>
            <div className="col gap-1">
              <div className="t-caption">Status</div>
              <div className="t-small">{cur.pass.status}</div>
            </div>
          </div>
        </div>
        <div className="pass-qr"><QRPlaceholder seed={cur.pass.passId} /></div>
      </div>
      {passEntries.length > 1 ? (
        <div className="row" style={{ justifyContent: "center" }}>
          <Button size="sm" variant="ghost" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>← Previous</Button>
          <div className="t-small">{idx + 1} of {passEntries.length}</div>
          <Button size="sm" variant="ghost" disabled={idx === passEntries.length - 1} onClick={() => setIdx(i => Math.min(passEntries.length - 1, i + 1))}>Next →</Button>
        </div>
      ) : null}
    </div>
  );
}

// ---- Scanner ----------------------------------------------------------------
function ScannerScreen() {
  const [payload, setPayload] = React.useState("");
  const [result, setResult] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const verify = () => {
    if (!payload.trim()) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      const p = payload.trim();
      if (p === "demo-used" || p.includes("used")) {
        setResult({ valid: true, pass: { passId: "P-T6F2-9KQX", status: "CONSUMED" }, reason: "Pass already used." });
      } else if (p === "demo-invalid" || p.startsWith("{")) {
        setResult({ valid: true, pass: { passId: "P-T6F2-9KQX", status: "ISSUED", eventId: "e1" }, reason: "Welcome." });
      } else {
        setResult({ valid: false, pass: null, reason: "Signature mismatch — pass may be tampered." });
      }
    }, 400);
  };

  if (result) {
    if (result.valid && result.pass?.status === "ISSUED") {
      return (
        <div className="col gap-4">
          <div className="scanner-result">
            <div className="icon-circle success"><Icon name="check" /></div>
            <h1 className="t-display" style={{ margin: 0, color: "var(--color-success)" }}>Pass is valid</h1>
            <div className="t-body">Welcome.</div>
            <div className="t-caption" style={{ fontFamily: "ui-monospace, monospace", textTransform: "none" }}>{result.pass.passId}</div>
            <div className="row gap-2" style={{ marginTop: 16 }}>
              <Button variant="primary" onClick={() => setResult(null)}>Mark as used</Button>
              <Button variant="ghost" onClick={() => { setResult(null); setPayload(""); }}>Scan another</Button>
            </div>
          </div>
        </div>
      );
    }
    if (result.valid && result.pass?.status === "CONSUMED") {
      return (
        <div className="col gap-4">
          <div className="scanner-result">
            <div className="icon-circle warning"><Icon name="alert" /></div>
            <h1 className="t-display" style={{ margin: 0, color: "var(--color-warning)" }}>Already used</h1>
            <div className="t-body">This pass has already been scanned in.</div>
            <Button variant="primary" onClick={() => { setResult(null); setPayload(""); }}>Scan another</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="col gap-4">
        <div className="scanner-result">
          <div className="icon-circle danger"><Icon name="x" /></div>
          <h1 className="t-display" style={{ margin: 0, color: "var(--color-danger)" }}>Pass is invalid</h1>
          <div className="t-body">{result.reason}</div>
          <Button variant="primary" onClick={() => { setResult(null); setPayload(""); }}>Scan another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Scanner</h1>
          <div className="t-small">Verify a gate pass at the door.</div>
        </div>
      </header>
      <Card>
        <Field label="QR payload (JSON)" helper="Try 'demo-valid', 'demo-used' or '{...}' to see different outcomes.">
          <Textarea value={payload} onChange={setPayload} rows={6}
            style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}
            placeholder='{"v":1,"passId":"…","sig":"…"}' />
        </Field>
        <Banner kind="info">
          The verify endpoint returns 200 with <code>success: false</code> when a pass fails its checks — those failures are shown inline.
        </Banner>
        <div className="row gap-2 mt-3" style={{ justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setPayload("")}>Clear</Button>
          <Button variant="primary" leadingIcon="scan" loading={busy} onClick={verify}>Verify pass</Button>
        </div>
      </Card>
    </div>
  );
}

// ---- Approvals (admin) ------------------------------------------------------
function ApprovalsScreen({ ctx }) {
  const { events, navigate, removeEventFromQueue } = ctx;
  const queue = events.filter(e => e.status === "PENDING_APPROVAL");
  // For preview, no pending events in mock — show "all caught up"
  if (queue.length === 0) {
    return (
      <div className="col gap-4">
        <h1 className="t-display" style={{ margin: 0 }}>Approvals</h1>
        <EmptyState icon="check-circle" title="You're all caught up" body="No events are waiting for approval right now." />
      </div>
    );
  }
  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Approvals</h1>
          <div className="t-small">{queue.length} events waiting for review.</div>
        </div>
      </header>
      <Card className="card-flush">
        <div className="list">
          {queue.map(ev => (
            <div key={ev._id} className="row-item" style={{ flexWrap: "wrap" }}>
              <button onClick={() => navigate({ name: "event", id: ev._id })}
                style={{ flex: 1, background: "transparent", border: 0, textAlign: "left", padding: 0, cursor: "pointer", color: "inherit", minWidth: 240 }}
                className="col gap-1">
                <Pill status={ev.status} />
                <div className="t-strong">{ev.title}</div>
                <div className="t-small">{MOCK.fmtCardDateTime(ev.startTime)} · {ev.venueName}</div>
              </button>
              <div className="row gap-2">
                <Button size="sm" variant="primary" onClick={() => removeEventFromQueue(ev._id)}>Approve</Button>
                <Button size="sm" variant="ghost" style={{ color: "var(--color-danger)" }} onClick={() => removeEventFromQueue(ev._id)}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---- Profile ----------------------------------------------------------------
function ProfileScreen({ ctx }) {
  const { user, signOut } = ctx;
  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Profile</h1>
          <div className="t-small">Your account and access.</div>
        </div>
      </header>
      <Card>
        <div className="row gap-4" style={{ alignItems: "center" }}>
          <Avatar name={user.fullName} size="lg" />
          <div className="col gap-1">
            <div className="t-h1">{user.fullName}</div>
            <div className="t-small">{user.email}</div>
            <div className="row gap-1 mt-2">
              {user.roles.map(r => <Pill key={r} tone="info">{r.toLowerCase()}</Pill>)}
            </div>
          </div>
        </div>
      </Card>
      <Card className="card-flush">
        <div className="list">
          <div className="row-item" style={{ cursor: "default" }}>
            <div className="col gap-1" style={{ flex: 1 }}>
              <div className="t-caption">Department</div>
              <div className="t-body">{user.department}</div>
            </div>
          </div>
          <div className="row-item" style={{ cursor: "default" }}>
            <div className="col gap-1" style={{ flex: 1 }}>
              <div className="t-caption">Year</div>
              <div className="t-body">{user.year ? `Year ${user.year}` : "—"}</div>
            </div>
          </div>
        </div>
      </Card>
      <Button variant="ghost" leadingIcon="logout" onClick={signOut} style={{ color: "var(--color-danger)", alignSelf: "flex-start" }}>
        Sign out
      </Button>
    </div>
  );
}

Object.assign(window, {
  LoginScreen, HomeScreen, EventsScreen, EventDetailScreen,
  MyEventsScreen, MyPassScreen, ScannerScreen, ApprovalsScreen, ProfileScreen,
});

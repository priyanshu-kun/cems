// CEMS — Student screens: Home, EventDetail, MyEvents, MyPass, Profile

// ---------- Event Card (used on Home + Lists) ----------
function EventCard({ event, rsvped, onToggleRsvp, onOpen }) {
  const isFull = event.rsvpCount >= event.capacity && !rsvped;
  return (
    <Card className="event-card" as="div">
      <div className="row-between" style={{gap:12}}>
        <button onClick={onOpen} aria-label={`Open ${event.title}`}
                style={{flex:1, background:"transparent", border:0, padding:0, textAlign:"left", cursor:"pointer", display:"flex", flexDirection:"column", gap:8, color:"inherit"}}>
          <div className="t-caption" style={{textTransform:"uppercase", letterSpacing:"0.04em"}}>{event.organizerName}</div>
          <div className="t-h2" style={{textWrap:"pretty"}}>{event.title}</div>
          <div className="row gap-2 t-small">
            <Icon name="calendar" size={14} color="var(--color-text-secondary)" />
            <span>{window.fmtCardDateTime(event.start)}</span>
          </div>
          <div className="row gap-2 t-small">
            <Icon name="map-pin" size={14} color="var(--color-text-secondary)" />
            <span>{event.venueName}</span>
          </div>
        </button>
        <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12, alignSelf:"stretch", justifyContent:"space-between"}}>
          <Pill status={event.status} />
          <button
            className={`btn btn-sm ${rsvped ? "btn-secondary" : "btn-primary"}`}
            onClick={e => { e.stopPropagation(); onToggleRsvp(event.id); }}
            disabled={isFull}
            style={{minHeight: 36, borderRadius: 999, padding: "0 14px"}}>
            {rsvped ? (<><Icon name="check" size={16} /><span>Going</span></>)
              : isFull ? "Full" : "RSVP"}
          </button>
        </div>
      </div>
    </Card>
  );
}

// ---------- Home ----------
function HomeScreen({ ctx, demoState = "default" }) {
  const { data, rsvps, toggleRsvp, push, user, role, openCreateAnnouncement, toast } = ctx;
  const announcements = data.announcements;
  const upcoming = data.events
    .filter(e => e.status === "PUBLISHED" && new Date(e.end) >= new Date(Date.now() - 86400000))
    .sort((a,b) => new Date(a.start) - new Date(b.start));

  if (demoState === "loading") {
    return (
      <React.Fragment>
        <div className="scroll">
          <div className="t-display">Hi, {user.name.split(" ")[0]}</div>
          <div className="t-small">Loading the latest from campus…</div>
          <div className="mt-2 t-strong">Announcements</div>
          <div className="row gap-3" style={{overflow:"hidden"}}>
            <div className="card" style={{minWidth:240}}><Skeleton w="40%" h={12} /><div className="mt-2"><Skeleton w="90%" h={16} /></div><div className="mt-2"><Skeleton w="60%" h={14} /></div></div>
            <div className="card" style={{minWidth:240}}><Skeleton w="40%" h={12} /><div className="mt-2"><Skeleton w="90%" h={16} /></div><div className="mt-2"><Skeleton w="60%" h={14} /></div></div>
          </div>
          <div className="mt-2 t-strong">Upcoming events</div>
          <SkelEventCard /><SkelEventCard /><SkelEventCard />
        </div>
      </React.Fragment>
    );
  }
  if (demoState === "error") {
    return (
      <div className="scroll">
        <div className="t-display">Hi, {user.name.split(" ")[0]}</div>
        <Banner kind="danger">
          <div>Couldn't load events.</div>
          <div className="mt-2"><Button size="sm" variant="secondary" onClick={() => toast({kind:"default", text:"Retrying…"})}>Retry</Button></div>
        </Banner>
      </div>
    );
  }
  const isEmpty = demoState === "empty";

  return (
    <React.Fragment>
      <div className="scroll scroll-with-fab">
        <div>
          <div className="t-display">Hi, {user.name.split(" ")[0]}</div>
          <div className="t-small">Here's what's happening on campus.</div>
        </div>

        <div>
          <div className="row-between" style={{marginBottom: 8}}>
            <div className="t-strong">Announcements</div>
            <a href="#" className="t-small" style={{color:"var(--color-primary)", fontWeight:600, textDecoration:"none"}} onClick={e => e.preventDefault()}>See all</a>
          </div>
          {isEmpty ? (
            <div className="t-small" style={{padding:"8px 0"}}>No announcements right now.</div>
          ) : (
            <div className="carousel">
              {announcements.slice(0,4).map(a => (
                <button key={a.id} onClick={() => a.eventId && push({type:"event-detail", id:a.eventId})}
                        className="card" style={{minWidth:240, maxWidth:260, textAlign:"left", cursor:"pointer", background:"#fff"}}>
                  <div className="t-caption" style={{color:"var(--color-primary)", textTransform:"uppercase", letterSpacing:"0.05em"}}>{a.postedBy}</div>
                  <div className="t-strong mt-2" style={{textWrap:"pretty"}}>{a.title}</div>
                  <div className="t-small mt-2" style={{textWrap:"pretty"}}>{a.body}</div>
                </button>
              ))}
              <div className="card row" style={{minWidth:120, alignItems:"center", justifyContent:"center"}}>
                <div className="t-strong" style={{color:"var(--color-primary)"}}>See all →</div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="t-strong" style={{marginBottom: 8}}>Upcoming events</div>
          {isEmpty || upcoming.length === 0 ? (
            <EmptyState icon="calendar-empty"
              title="No upcoming events right now."
              action={role === "ORGANIZER" ? <Button variant="secondary" size="sm" leadingIcon="plus" onClick={() => push({type:"create-event"})}>Create one</Button> : null} />
          ) : (
            <div className="col gap-3">
              {upcoming.map(ev => (
                <EventCard key={ev.id} event={ev} rsvped={rsvps.includes(ev.id)}
                           onToggleRsvp={toggleRsvp} onOpen={() => push({type:"event-detail", id: ev.id})} />
              ))}
            </div>
          )}
        </div>
      </div>

      {role === "ORGANIZER" ? <FAB onClick={openCreateAnnouncement} label="Post announcement" /> : null}
    </React.Fragment>
  );
}

// ---------- Event Detail ----------
function EventDetailScreen({ ctx, eventId, demoState = "default" }) {
  const { data, rsvps, toggleRsvp, pop, role, openModal, push, user, toast, setEvents } = ctx;
  const event = data.events.find(e => e.id === eventId);

  if (demoState === "loading") {
    return (
      <div className="scroll">
        <Skeleton w={90} h={20} r={6} />
        <Skeleton w="80%" h={28} />
        <Skeleton w="60%" h={16} />
        <Skeleton w="50%" h={16} />
        <div className="mt-4"><Skeleton w="100%" h={80} /></div>
        <Skeleton w="100%" h={48} />
      </div>
    );
  }
  if (demoState === "error" || !event) {
    return (
      <div className="scroll">
        <Banner kind="danger">
          <div>Couldn't load this event.</div>
          <div className="mt-2"><Button size="sm" variant="secondary" onClick={() => toast({text:"Retrying…"})}>Retry</Button></div>
        </Banner>
      </div>
    );
  }

  const rsvped = rsvps.includes(event.id);
  const isFull = event.rsvpCount >= event.capacity && !rsvped;
  const inactive = !["APPROVED","PUBLISHED","ONGOING"].includes(event.status);

  const onCancelRsvp = () => openModal({
    title: "Cancel your RSVP?",
    body: "You'll lose your spot and your gate pass for this event.",
    primaryLabel: "Cancel RSVP",
    onPrimary: () => { toggleRsvp(event.id); toast({kind:"default", text:"RSVP cancelled."}); }
  });

  const onCancelEvent = () => openModal({
    title: "Cancel this event?",
    body: "Everyone who RSVPed will be notified.",
    primaryLabel: "Cancel event",
    onPrimary: () => { setEvents(evs => evs.map(e => e.id === event.id ? {...e, status:"CANCELLED"} : e)); toast({kind:"default", text:"Event cancelled."}); pop(); }
  });

  // Admin manage actions
  const adminActions = role === "ADMIN" ? (
    <Card className="col gap-3">
      <div className="t-strong">Admin actions</div>
      <div className="col gap-2">
        {event.status === "PENDING_APPROVAL" && (
          <Button variant="primary" block onClick={() => { setEvents(evs => evs.map(e => e.id === event.id ? {...e, status:"APPROVED"} : e)); toast({kind:"success", text:"Event approved."}); }}>Approve event</Button>
        )}
        {event.status === "APPROVED" && (
          <Button variant="primary" block onClick={() => { setEvents(evs => evs.map(e => e.id === event.id ? {...e, status:"PUBLISHED"} : e)); toast({kind:"success", text:"Event published."}); }}>Mark as published</Button>
        )}
        {!["CANCELLED","COMPLETED"].includes(event.status) && (
          <Button variant="danger" block onClick={onCancelEvent}>Cancel event</Button>
        )}
      </div>
    </Card>
  ) : null;

  // Organizer manage actions (owner)
  const isOwner = role === "ORGANIZER" && event.organizerId === user.id;
  const organizerActions = isOwner ? (
    <Card className="col gap-3">
      <div className="t-strong">Manage</div>
      <div className="col gap-2">
        {event.status === "DRAFT" && (
          <Button variant="primary" block onClick={() => { setEvents(evs => evs.map(e => e.id === event.id ? {...e, status:"PENDING_APPROVAL"} : e)); toast({kind:"success", text:"Event submitted for approval."}); }}>Submit for approval</Button>
        )}
        {!["CANCELLED","COMPLETED"].includes(event.status) && (
          <Button variant="danger" block onClick={onCancelEvent}>Cancel event</Button>
        )}
      </div>
    </Card>
  ) : null;

  return (
    <div className="scroll">
      <div className="col gap-3">
        <div className="row gap-2"><Pill status={event.status} /></div>
        <div className="t-display" style={{textWrap:"pretty"}}>{event.title}</div>
        <div className="col gap-2">
          <div className="row gap-2 t-small"><Icon name="calendar" size={16} color="var(--color-text-secondary)" /><span>{window.fmtDateRange(event.start, event.end)}</span></div>
          <div className="row gap-2 t-small"><Icon name="map-pin" size={16} color="var(--color-text-secondary)" /><span>{event.venueName}</span></div>
          <div className="row gap-2 t-small"><Icon name="users" size={16} color="var(--color-text-secondary)" /><span>{event.rsvpCount} of {event.capacity} going</span></div>
        </div>
      </div>

      <div className="col gap-3">
        <Progress value={event.rsvpCount} max={event.capacity} />
      </div>

      <div className="t-body" style={{textWrap:"pretty"}}>{event.description}</div>

      {event.tags && event.tags.length ? (
        <div className="chips">
          {event.tags.map(t => <span key={t} className="chip chip-static">#{t}</span>)}
        </div>
      ) : null}

      {!inactive && (
        rsvped ? (
          <div className="col gap-3">
            <Button variant="secondary" block leadingIcon="check" onClick={onCancelRsvp}>You're going · Cancel RSVP</Button>
            <Banner kind="info" icon="ticket">Your gate pass is ready in the My Pass tab.</Banner>
          </div>
        ) : isFull ? (
          <Button variant="primary" block disabled>Event is full</Button>
        ) : (
          <Button variant="primary" block onClick={() => { toggleRsvp(event.id); toast({kind:"success", text:"You're going. Pass added to My Pass."}); }}>RSVP to this event</Button>
        )
      )}

      {event.status === "CANCELLED" && <Banner kind="danger">This event was cancelled.</Banner>}
      {event.status === "COMPLETED" && <Banner kind="info">This event has ended.</Banner>}

      {adminActions}
      {organizerActions}
    </div>
  );
}

// ---------- My Events ----------
function MyEventsScreen({ ctx, demoState = "default" }) {
  const { data, rsvps, push, role, user } = ctx;
  const isOrganizer = role === "ORGANIZER";
  const [tab, setTab] = React.useState("upcoming");
  const now = Date.now();

  const rsvpedEvents = data.events.filter(e => rsvps.includes(e.id));
  const upcoming = rsvpedEvents.filter(e => new Date(e.end) >= new Date(now - 86400000));
  const past = rsvpedEvents.filter(e => new Date(e.end) < new Date(now - 86400000));
  const mine = isOrganizer ? data.events.filter(e => e.organizerId === user.id) : [];

  const tabs = isOrganizer
    ? [{value:"upcoming",label:"Upcoming"},{value:"past",label:"Past"},{value:"mine",label:"Mine"}]
    : [{value:"upcoming",label:"Upcoming"},{value:"past",label:"Past"}];

  const list = tab === "upcoming" ? upcoming : tab === "past" ? past : mine;

  if (demoState === "loading") {
    return (
      <div className="scroll">
        <Segmented options={tabs} value={tab} onChange={setTab} />
        <SkelEventCard /><SkelEventCard /><SkelEventCard />
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="scroll scroll-with-fab">
        <Segmented options={tabs} value={tab} onChange={setTab} />

        {demoState === "error" ? (
          <Banner kind="danger">Couldn't load your events. <a href="#" onClick={e => e.preventDefault()} style={{fontWeight:600, color:"inherit"}}>Retry</a></Banner>
        ) : demoState === "empty" || list.length === 0 ? (
          tab === "upcoming" ? (
            <EmptyState icon="calendar-empty"
              title="You haven't RSVPed to anything yet."
              action={<Button variant="secondary" size="sm" onClick={() => ctx.goToTab("home")}>Browse events</Button>} />
          ) : tab === "past" ? (
            <EmptyState icon="inbox" title="No past events." />
          ) : (
            <EmptyState icon="calendar-empty"
              title="You haven't created any events yet."
              action={<Button variant="secondary" size="sm" leadingIcon="plus" onClick={() => push({type:"create-event"})}>Create event</Button>} />
          )
        ) : (
          <div className="card card-flush">
            <div className="list">
              {list.map(ev => (
                <button key={ev.id} className="row-item" onClick={() => push({type:"event-detail", id: ev.id})}>
                  <div style={{flex:1, minWidth:0}} className="col gap-1">
                    <div className="row gap-2"><Pill status={ev.status} /></div>
                    <div className="t-strong" style={{textWrap:"pretty"}}>{ev.title}</div>
                    <div className="t-small">{window.fmtCardDateTime(ev.start)} · {ev.venueName}</div>
                  </div>
                  <Icon name="chevron-right" color="var(--color-text-secondary)" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {isOrganizer && tab === "mine" ? <FAB onClick={() => push({type:"create-event"})} label="Create event" /> : null}
    </React.Fragment>
  );
}

// ---------- My Pass ----------
function MyPassScreen({ ctx, demoState = "default" }) {
  const { data, rsvps, push } = ctx;
  const [idx, setIdx] = React.useState(0);

  const passes = data.events
    .filter(e => rsvps.includes(e.id) && data.passes[e.id])
    .map(e => ({ event: e, pass: data.passes[e.id] }));

  if (demoState === "loading") {
    return (
      <div className="scroll">
        <div className="qr-card">
          <Skeleton w="70%" h={20} /><Skeleton w="50%" h={14} />
          <Skeleton h={240} r={10} />
          <Skeleton w="60%" h={14} />
        </div>
      </div>
    );
  }
  if (demoState === "error") {
    return (
      <div className="scroll">
        <Banner kind="danger">
          <div>Couldn't load your pass.</div>
          <div className="mt-2"><Button size="sm" variant="secondary">Retry</Button></div>
        </Banner>
      </div>
    );
  }
  if (demoState === "empty" || passes.length === 0) {
    return (
      <div className="scroll" style={{justifyContent:"center"}}>
        <EmptyState icon="ticket"
          title="No active passes. RSVP to an event to get one."
          action={<Button variant="secondary" size="sm" onClick={() => ctx.goToTab("home")}>Browse events</Button>} />
      </div>
    );
  }

  const showExpired = demoState === "expired";
  const cur = passes[Math.min(idx, passes.length - 1)];

  return (
    <div className="scroll" style={{gap: 16}}>
      <div className="t-h1">My pass</div>
      <div className="t-small">Show this at the gate. Don't share it.</div>

      <div className="qr-card">
        <div>
          <div className="t-strong" style={{textWrap:"pretty"}}>{cur.event.title}</div>
          <div className="t-small mt-2">{window.fmtCardDateTime(cur.event.start)}</div>
          <div className="t-small">{cur.event.venueName}</div>
        </div>
        <div className={`qr-frame ${showExpired ? "qr-expired" : ""}`}>
          <QRPlaceholder seed={cur.pass.passId} />
          {showExpired ? <div className="qr-expired-stamp">EXPIRED</div> : null}
        </div>
        <div className="row-between">
          <div className="col gap-1">
            <div className="t-caption">PASS ID</div>
            <div className="t-small" style={{fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", color:"var(--color-text)"}}>{cur.pass.passId}</div>
          </div>
          <div className="col gap-1" style={{textAlign:"right"}}>
            <div className="t-caption">VALID UNTIL</div>
            <div className="t-small" style={{color: showExpired ? "var(--color-danger)" : "var(--color-text)"}}>{window.fmtTime(cur.pass.validUntil)}</div>
          </div>
        </div>
      </div>

      {passes.length > 1 ? (
        <React.Fragment>
          <div className="dots">
            {passes.map((_,i) => <span key={i} className={`dot ${i === idx ? "active" : ""}`} />)}
          </div>
          <div className="row gap-2" style={{justifyContent:"center"}}>
            <Button size="sm" variant="ghost" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i-1))}>← Previous</Button>
            <Button size="sm" variant="ghost" disabled={idx === passes.length - 1} onClick={() => setIdx(i => Math.min(passes.length - 1, i+1))}>Next →</Button>
          </div>
        </React.Fragment>
      ) : null}
    </div>
  );
}

// ---------- Profile ----------
function ProfileScreen({ ctx, demoState = "default" }) {
  const { user, signOut, openModal, role, push } = ctx;

  if (demoState === "loading") {
    return (
      <div className="scroll">
        <Skeleton w={72} h={72} r={36} /><Skeleton w="50%" h={22} /><Skeleton w="60%" h={14} />
      </div>
    );
  }

  const onSignOut = () => openModal({
    title: "Sign out of CEMS?",
    body: null,
    primaryLabel: "Sign out",
    onPrimary: signOut,
  });

  return (
    <div className="scroll" style={{gap:20}}>
      <div className="row gap-4">
        <Avatar name={user.name} size="lg" />
        <div className="col gap-1">
          <div className="t-h1">{user.name}</div>
          <div className="t-small">{user.email}</div>
        </div>
      </div>

      <Card className="card-flush">
        <div className="list">
          <div className="row-item" style={{cursor:"default"}}>
            <div className="col gap-1" style={{flex:1}}>
              <div className="t-caption">DEPARTMENT</div>
              <div className="t-body">{user.department}</div>
            </div>
          </div>
          <div className="row-item" style={{cursor:"default"}}>
            <div className="col gap-1" style={{flex:1}}>
              <div className="t-caption">YEAR</div>
              <div className="t-body">{user.year === "—" ? "Faculty" : `Year ${user.year}`}</div>
            </div>
          </div>
          <div className="row-item" style={{cursor:"default"}}>
            <div className="col gap-1" style={{flex:1}}>
              <div className="t-caption">ROLES</div>
              <div className="chips mt-2">
                {user.roles.map(r => (
                  <span key={r} className="pill pill-PUBLISHED">{r.toLowerCase()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {role === "ADMIN" ? (
        <Card className="card-flush">
          <div className="list">
            <button className="row-item" onClick={() => push({type:"assets"})}>
              <div style={{flex:1}} className="col gap-1">
                <div className="t-strong">Manage assets</div>
                <div className="t-small">Mics, chairs, projectors and more.</div>
              </div>
              <Icon name="chevron-right" color="var(--color-text-secondary)" />
            </button>
          </div>
        </Card>
      ) : null}

      <Button variant="ghost" block onClick={onSignOut} leadingIcon="logout" style={{color:"var(--color-danger)"}}>Sign out</Button>
    </div>
  );
}

Object.assign(window, { HomeScreen, EventDetailScreen, MyEventsScreen, MyPassScreen, ProfileScreen, EventCard });

// CEMS — Admin screens: Approvals, Events (filterable list), Scanner, Assets

function ApprovalsScreen({ ctx, demoState = "default" }) {
  const { data, setEvents, openModal, toast, push } = ctx;
  const [leaving, setLeaving] = React.useState({});
  const queue = data.events.filter(e => e.status === "PENDING_APPROVAL");

  if (demoState === "loading") {
    return (
      <div className="scroll">
        <div className="t-display">Approvals</div>
        <div className="card card-flush"><div className="list">
          {[1,2,3,4].map(i => (
            <div className="row-item" key={i}>
              <div style={{flex:1}} className="col gap-2"><Skeleton w="70%" h={16} /><Skeleton w="50%" h={12} /></div>
              <Skeleton w={70} h={32} r={8} /><Skeleton w={70} h={32} r={8} />
            </div>
          ))}
        </div></div>
      </div>
    );
  }
  if (demoState === "error") {
    return <div className="scroll"><Banner kind="danger">Couldn't load the queue. <a href="#" onClick={e => e.preventDefault()} style={{fontWeight:600, color:"inherit"}}>Retry</a></Banner></div>;
  }

  if (demoState === "empty" || queue.length === 0) {
    return (
      <div className="scroll">
        <div className="t-display">Approvals</div>
        <EmptyState icon="check-circle"
          title="No events waiting for approval. You're all caught up." />
      </div>
    );
  }

  const approve = (ev) => {
    if (ev.id === "e9") {
      toast({kind:"danger", text:"Venue conflict — another event already approved for this slot."});
      return;
    }
    setLeaving(l => ({...l, [ev.id]: true}));
    setTimeout(() => {
      setEvents(evs => evs.map(e => e.id === ev.id ? {...e, status:"APPROVED"} : e));
      toast({kind:"success", text:"Event approved."});
    }, 150);
  };
  const reject = (ev) => openModal({
    title: "Reject this event?",
    body: "The organizer will need to submit again.",
    primaryLabel: "Reject",
    onPrimary: () => {
      setLeaving(l => ({...l, [ev.id]: true}));
      setTimeout(() => {
        setEvents(evs => evs.map(e => e.id === ev.id ? {...e, status:"CANCELLED"} : e));
        toast({text:"Event rejected."});
      }, 150);
    }
  });

  return (
    <div className="scroll">
      <div className="t-display">Approvals</div>
      <div className="t-small">{queue.length} {queue.length === 1 ? "event" : "events"} waiting for review.</div>

      <div className="card card-flush">
        <div className="list">
          {queue.map(ev => (
            <div key={ev.id} className={`row-item ${leaving[ev.id] ? "row-leave" : ""}`} style={{cursor:"default"}}>
              <button onClick={() => push({type:"event-detail", id: ev.id})}
                      style={{flex:1, background:"transparent", border:0, textAlign:"left", padding:0, cursor:"pointer", color:"inherit"}}
                      className="col gap-1">
                <div className="t-caption" style={{textTransform:"uppercase", letterSpacing:"0.04em"}}>{ev.organizerName}</div>
                <div className="t-strong" style={{textWrap:"pretty"}}>{ev.title}</div>
                <div className="t-small">{window.fmtCardDateTime(ev.start)} · {ev.venueName}</div>
              </button>
              <div className="col gap-2" style={{alignItems:"stretch"}}>
                <Button size="sm" variant="primary" onClick={() => approve(ev)}>Approve</Button>
                <Button size="sm" variant="ghost" onClick={() => reject(ev)} style={{color:"var(--color-danger)"}}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminEventsScreen({ ctx, demoState = "default" }) {
  const { data, push } = ctx;
  const [filter, setFilter] = React.useState("ALL");

  const FILTERS = [
    {value:"ALL", label:"All"},
    {value:"APPROVED", label:"Approved"},
    {value:"PUBLISHED", label:"Published"},
    {value:"ONGOING", label:"Live"},
    {value:"COMPLETED", label:"Done"},
    {value:"CANCELLED", label:"Cancelled"},
  ];

  if (demoState === "loading") {
    return (
      <div className="scroll">
        <div className="t-display">Events</div>
        <div style={{overflowX:"auto"}}><Segmented options={FILTERS} value={filter} onChange={setFilter} /></div>
        <SkelEventCard /><SkelEventCard /><SkelEventCard />
      </div>
    );
  }

  let list = data.events;
  if (filter !== "ALL") list = list.filter(e => e.status === filter);

  return (
    <div className="scroll">
      <div className="t-display">Events</div>
      <div style={{margin:"0 -4px", overflowX:"auto"}} className="no-scrollbar">
        <div style={{minWidth: 500}}><Segmented options={FILTERS} value={filter} onChange={setFilter} /></div>
      </div>

      {demoState === "error" ? (
        <Banner kind="danger">Couldn't load events. <a href="#" onClick={e => e.preventDefault()} style={{fontWeight:600, color:"inherit"}}>Retry</a></Banner>
      ) : list.length === 0 ? (
        <EmptyState icon="calendar-empty" title={`No ${filter === "ALL" ? "" : filter.toLowerCase() + " "}events.`} />
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
  );
}

function ScannerScreen({ ctx, demoState = "default" }) {
  const { data, toast } = ctx;
  const [payload, setPayload] = React.useState("");
  const [result, setResult] = React.useState(null); // {kind: 'valid'|'invalid'|'used', event, pass, reason}
  const [verifying, setVerifying] = React.useState(false);

  React.useEffect(() => {
    if (demoState === "success") {
      setResult({ kind: "valid", event: data.events.find(e => e.id === "e1"), passId: "P-T6F2-9KQX", userName: "Aarav Sharma" });
    } else if (demoState === "error") {
      setResult({ kind: "invalid", reason: "Signature mismatch — it may have been tampered with." });
    } else if (demoState === "used") {
      setResult({ kind: "used", event: data.events.find(e => e.id === "e1"), passId: "P-T6F2-9KQX" });
    } else {
      setResult(null);
    }
  }, [demoState]);

  const verify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      const p = payload.trim();
      if (!p) { toast({kind:"danger", text:"Paste a QR payload first."}); return; }
      if (p.startsWith("QR:e1") || p === "demo-valid") {
        setResult({ kind:"valid", event: data.events.find(e => e.id === "e1"), passId: "P-T6F2-9KQX", userName: "Aarav Sharma" });
      } else if (p === "demo-used") {
        setResult({ kind:"used", event: data.events.find(e => e.id === "e1"), passId: "P-T6F2-9KQX" });
      } else {
        setResult({ kind:"invalid", reason: "This pass could not be verified. The code may be wrong or it may have expired." });
      }
    }, 500);
  };

  const reset = () => { setResult(null); setPayload(""); };
  const markUsed = () => {
    toast({kind:"success", text:"Pass marked as used."});
    reset();
  };

  if (result) {
    if (result.kind === "valid") {
      return (
        <div className="bleed">
          <div className="icon-circle success"><Icon name="check" /></div>
          <div className="t-display t-success">Pass is valid</div>
          <div className="col gap-1" style={{alignItems:"center"}}>
            <div className="t-strong">{result.event.title}</div>
            <div className="t-small">{result.userName}</div>
            <div className="t-caption" style={{fontFamily:"ui-monospace, monospace"}}>{result.passId}</div>
          </div>
          <div className="col gap-2" style={{width:"100%", maxWidth: 320, marginTop: 16}}>
            <Button variant="primary" block onClick={markUsed}>Mark as used</Button>
            <Button variant="ghost" block onClick={reset}>Scan another</Button>
          </div>
        </div>
      );
    }
    if (result.kind === "invalid") {
      return (
        <div className="bleed">
          <div className="icon-circle danger"><Icon name="x" /></div>
          <div className="t-display t-danger">Pass is invalid</div>
          <div className="t-body" style={{maxWidth: 320, textWrap:"pretty"}}>{result.reason}</div>
          <Button variant="primary" block style={{maxWidth: 320, marginTop: 16}} onClick={reset}>Scan another</Button>
        </div>
      );
    }
    if (result.kind === "used") {
      return (
        <div className="bleed">
          <div className="icon-circle warning"><Icon name="alert" /></div>
          <div className="t-display" style={{color:"var(--color-warning)"}}>Already used</div>
          <div className="t-body" style={{maxWidth: 320, textWrap:"pretty"}}>This pass has already been used. Ask the student to step aside if you need to verify.</div>
          <div className="col gap-1" style={{alignItems:"center", marginTop: 8}}>
            <div className="t-small">{result.event.title}</div>
            <div className="t-caption" style={{fontFamily:"ui-monospace, monospace"}}>{result.passId}</div>
          </div>
          <Button variant="primary" block style={{maxWidth: 320, marginTop: 16}} onClick={reset}>Scan another</Button>
        </div>
      );
    }
  }

  return (
    <div className="scroll">
      <div className="t-display">Scanner</div>
      <div className="t-small">Paste or scan the QR code from the student's pass.</div>

      <Field label="QR payload">
        <textarea className="textarea" value={payload} onChange={e => setPayload(e.target.value)} rows={6}
                  style={{fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", fontSize:14}}
                  placeholder='{"passId":"P-T6F2-9KQX","sig":"..."}' />
      </Field>
      <Banner kind="info">
        Tip — for the demo, paste <code style={{background:"rgba(0,0,0,0.05)", padding:"0 4px", borderRadius:4}}>demo-valid</code>, <code style={{background:"rgba(0,0,0,0.05)", padding:"0 4px", borderRadius:4}}>demo-used</code> or anything else to try invalid.
      </Banner>
      <Button variant="primary" block leadingIcon="scan" loading={verifying} onClick={verify}>Verify pass</Button>
    </div>
  );
}

function AssetsScreen({ ctx }) {
  const { data, toast } = ctx;
  const [assets, setAssets] = React.useState(data.assets);
  const [sheet, setSheet] = React.useState(null);
  const [qty, setQty] = React.useState(1);

  const openSheet = (a) => { setSheet(a); setQty(1); };

  const reserve = () => {
    setAssets(arr => arr.map(a => a.id === sheet.id ? {...a, available: Math.max(0, a.available - qty)} : a));
    toast({kind:"success", text:`Reserved ${qty} × ${sheet.name}.`});
    setSheet(null);
  };
  const release = () => {
    setAssets(arr => arr.map(a => a.id === sheet.id ? {...a, available: Math.min(a.total, a.available + qty)} : a));
    toast({kind:"success", text:`Released ${qty} × ${sheet.name}.`});
    setSheet(null);
  };

  return (
    <React.Fragment>
      <div className="scroll">
        <div className="t-h1">Assets</div>
        <div className="t-small">Shared event inventory. Tap a row to reserve or release.</div>

        <div className="card card-flush">
          <div className="list">
            {assets.map(a => (
              <button key={a.id} className="row-item" onClick={() => openSheet(a)}>
                <div style={{flex:1}} className="col gap-1">
                  <div className="t-caption">{a.category.toUpperCase()}</div>
                  <div className="t-strong">{a.name}</div>
                  <div className="t-small">{a.available} of {a.total} available</div>
                </div>
                <Icon name="chevron-right" color="var(--color-text-secondary)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {sheet ? (
        <div className="modal-root" onClick={() => setSheet(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-grabber" />
            <div className="modal-title">{sheet.name}</div>
            <div className="modal-body">{sheet.available} of {sheet.total} available · {sheet.category}</div>
            <div className="row gap-3 mt-6" style={{justifyContent:"space-between"}}>
              <div className="t-strong">Quantity</div>
              <div className="row gap-2">
                <Button size="sm" variant="secondary" onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
                <div className="t-strong" style={{minWidth: 24, textAlign:"center"}}>{qty}</div>
                <Button size="sm" variant="secondary" onClick={() => setQty(q => Math.min(sheet.available || sheet.total, q + 1))}>+</Button>
              </div>
            </div>
            <div className="modal-actions">
              <Button variant="primary" block onClick={reserve} disabled={sheet.available === 0}>Reserve</Button>
              <Button variant="secondary" block onClick={release} disabled={sheet.available === sheet.total}>Release</Button>
              <Button variant="ghost" block onClick={() => setSheet(null)}>Close</Button>
            </div>
          </div>
        </div>
      ) : null}
    </React.Fragment>
  );
}

Object.assign(window, { ApprovalsScreen, AdminEventsScreen, ScannerScreen, AssetsScreen });

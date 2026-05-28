import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import { Card, Banner, EmptyState, Skeleton } from "../components/Primitives.jsx";
import { QRPlaceholder } from "../components/QR.jsx";
import * as EventsAPI from "../api/events.js";
import * as GatePassAPI from "../api/gatePass.js";
import { useToast } from "../context/ToastContext.jsx";
import { usePasses, useRsvps } from "../hooks/useLocalStore.js";
import { errorMessage, fmtCardDateTime, fmtTime } from "../utils/format.js";
import config from "../config.js";

export function MyPassPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { ids: rsvpIds } = useRsvps();
  const { byEventId, put } = usePasses();

  const [eventsById, setEventsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState({});
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => { document.title = `My pass · ${config.appName}`; }, []);

  useEffect(() => {
    let alive = true;
    if (rsvpIds.length === 0) { setEventsById({}); setLoading(false); return; }
    setLoading(true);
    Promise.all(rsvpIds.map((id) => EventsAPI.getEvent(id).catch(() => null)))
      .then((arr) => {
        if (!alive) return;
        const m = {};
        arr.forEach((e) => { if (e) m[e._id] = e; });
        setEventsById(m);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [rsvpIds.join(",")]); // eslint-disable-line

  const issuableIds = rsvpIds.filter((id) => eventsById[id] && !byEventId[id]);
  const passEntries = rsvpIds
    .filter((id) => byEventId[id] && eventsById[id])
    .map((id) => ({ id, pass: byEventId[id].pass, qr: byEventId[id].qr, event: eventsById[id] }));

  const issue = async (eventId) => {
    setIssuing((s) => ({ ...s, [eventId]: true }));
    try {
      const { pass, qr } = await GatePassAPI.issuePass(eventId);
      put(eventId, { pass, qr });
      toast.success("Pass issued.");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't issue pass."));
    } finally {
      setIssuing((s) => ({ ...s, [eventId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="col gap-4">
        <h1 className="t-display" style={{ margin: 0 }}>My pass</h1>
        <div className="pass-card">
          <div className="pass-info">
            <Skeleton w="70%" h={20} /><Skeleton w="50%" h={14} /><Skeleton w="50%" h={14} />
          </div>
          <div className="pass-qr"><Skeleton w="100%" h="100%" r={6} /></div>
        </div>
      </div>
    );
  }

  if (passEntries.length === 0 && issuableIds.length === 0) {
    return (
      <div className="col gap-4">
        <h1 className="t-display" style={{ margin: 0 }}>My pass</h1>
        <EmptyState
          icon="ticket"
          title="No active passes"
          body="RSVP to an event to get a pass."
          action={<Button variant="secondary" onClick={() => navigate("/events")}>Browse events</Button>}
        />
      </div>
    );
  }

  const cur = passEntries[Math.min(activeIdx, passEntries.length - 1)] || null;

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>My pass</h1>
          <div className="t-small">Show this at the gate. Don't share the QR code.</div>
        </div>
      </header>

      {/* Events RSVPed but no pass yet — let the user issue one */}
      {issuableIds.length > 0 ? (
        <Card>
          <div className="t-strong">Issue a pass</div>
          <div className="t-small" style={{ marginTop: 4 }}>You're RSVPed to these events. Issue a pass when you're ready.</div>
          <div className="col gap-2 mt-3">
            {issuableIds.map((id) => {
              const ev = eventsById[id];
              return (
                <div key={id} className="row-between" style={{ flexWrap: "wrap", gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="t-strong" style={{ textWrap: "pretty" }}>{ev.title}</div>
                    <div className="t-small">{fmtCardDateTime(ev.startTime)} · {ev.venueName || ev.venueId}</div>
                  </div>
                  <Button size="sm" variant="primary" loading={!!issuing[id]} onClick={() => issue(id)}>
                    Issue pass
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {cur ? (
        <PassCard entry={cur} />
      ) : null}

      {passEntries.length > 1 ? (
        <div className="row" style={{ justifyContent: "center" }}>
          <Button size="sm" variant="ghost" disabled={activeIdx === 0} onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}>← Previous</Button>
          <div className="t-small">{activeIdx + 1} of {passEntries.length}</div>
          <Button size="sm" variant="ghost" disabled={activeIdx === passEntries.length - 1} onClick={() => setActiveIdx((i) => Math.min(passEntries.length - 1, i + 1))}>Next →</Button>
        </div>
      ) : null}
    </div>
  );
}

function PassCard({ entry }) {
  const { pass, qr, event } = entry;
  const expired = pass?.expiresAt ? new Date(pass.expiresAt).getTime() < Date.now() : false;
  const consumed = pass?.status === "CONSUMED";
  // The QR payload is what the verifier expects — encode it as JSON
  const qrSeed = qr ? JSON.stringify(qr) : pass?.passId || "pass";

  return (
    <div className="pass-card">
      <div className="pass-info">
        <div className="t-strong" style={{ textWrap: "pretty", fontSize: 18 }}>{event?.title || "Event"}</div>
        <div className="t-small">{event?.startTime ? fmtCardDateTime(event.startTime) : "—"}</div>
        <div className="t-small">{event?.venueName || event?.venueId || ""}</div>
        <div className="row gap-6 mt-3" style={{ flexWrap: "wrap" }}>
          <div className="col gap-1">
            <div className="t-caption">Pass ID</div>
            <div className="t-small" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: "var(--color-text)" }}>
              {pass?.passId || "—"}
            </div>
          </div>
          <div className="col gap-1">
            <div className="t-caption">Valid until</div>
            <div className="t-small" style={{ color: expired ? "var(--color-danger)" : "var(--color-text)" }}>
              {pass?.expiresAt ? fmtTime(pass.expiresAt) : "—"}
            </div>
          </div>
          {pass?.status ? (
            <div className="col gap-1">
              <div className="t-caption">Status</div>
              <div className="t-small">{pass.status}</div>
            </div>
          ) : null}
        </div>
        {consumed ? <Banner kind="info">This pass has already been scanned in.</Banner> : null}
        {expired && !consumed ? <Banner kind="warning">This pass has expired.</Banner> : null}
      </div>
      <div className={`pass-qr ${expired ? "qr-expired" : ""}`}>
        <QRPlaceholder seed={qrSeed} />
        {expired ? <div className="qr-expired-stamp">EXPIRED</div> : null}
      </div>
    </div>
  );
}

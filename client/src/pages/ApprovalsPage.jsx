import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import { Card, Banner, EmptyState, Skeleton, Pill } from "../components/Primitives.jsx";
import * as EventsAPI from "../api/events.js";
import { useToast } from "../context/ToastContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { errorMessage, fmtCardDateTime } from "../utils/format.js";
import config from "../config.js";

export function ApprovalsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { openModal } = useModal();

  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({});

  useEffect(() => { document.title = `Approvals · ${config.appName}`; }, []);

  const load = async () => {
    setQueue(null);
    setError(null);
    try {
      const data = await EventsAPI.listEvents({ status: "PENDING_APPROVAL", limit: 100 });
      setQueue(data.items || []);
    } catch (e) {
      setError(errorMessage(e, "Couldn't load the queue."));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const approve = async (ev) => {
    setBusy((b) => ({ ...b, [ev._id]: "approve" }));
    try {
      await EventsAPI.setEventStatus(ev._id, "APPROVED");
      setQueue((arr) => arr.filter((x) => x._id !== ev._id));
      toast.success("Event approved.");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't approve."));
    } finally {
      setBusy((b) => ({ ...b, [ev._id]: null }));
    }
  };

  const reject = (ev) =>
    openModal({
      title: "Reject this event?",
      body: "The organizer will need to submit again.",
      primaryLabel: "Reject",
      onPrimary: async () => {
        setBusy((b) => ({ ...b, [ev._id]: "reject" }));
        try {
          await EventsAPI.setEventStatus(ev._id, "CANCELLED");
          setQueue((arr) => arr.filter((x) => x._id !== ev._id));
          toast.info("Event rejected.");
        } catch (e) {
          toast.error(errorMessage(e, "Couldn't reject."));
        } finally {
          setBusy((b) => ({ ...b, [ev._id]: null }));
        }
      },
    });

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Approvals</h1>
          <div className="t-small">
            {queue === null ? "Loading…" : queue.length === 0 ? "All caught up." : `${queue.length} ${queue.length === 1 ? "event" : "events"} waiting for review.`}
          </div>
        </div>
      </header>

      {error ? (
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      ) : null}

      {queue === null ? (
        <Card className="card-flush">
          <div className="list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="row-item">
                <div style={{ flex: 1 }} className="col gap-2"><Skeleton w="70%" h={16} /><Skeleton w="50%" h={12} /></div>
                <Skeleton w={70} h={32} r={8} /><Skeleton w={70} h={32} r={8} />
              </div>
            ))}
          </div>
        </Card>
      ) : queue.length === 0 ? (
        <EmptyState icon="check-circle" title="You're all caught up" body="No events are waiting for approval right now." />
      ) : (
        <Card className="card-flush">
          <div className="list">
            {queue.map((ev) => (
              <div key={ev._id} className="row-item" style={{ cursor: "default", flexWrap: "wrap" }}>
                <button
                  onClick={() => navigate(`/events/${ev._id}`)}
                  style={{ flex: 1, background: "transparent", border: 0, textAlign: "left", padding: 0, cursor: "pointer", color: "inherit", minWidth: 240 }}
                  className="col gap-1"
                >
                  <div className="row gap-2"><Pill status={ev.status} /></div>
                  <div className="t-strong" style={{ textWrap: "pretty" }}>{ev.title}</div>
                  <div className="t-small">{fmtCardDateTime(ev.startTime)} · {ev.venueName || ev.venueId}</div>
                </button>
                <div className="row gap-2">
                  <Button size="sm" variant="primary" loading={busy[ev._id] === "approve"} onClick={() => approve(ev)}>Approve</Button>
                  <Button size="sm" variant="ghost" loading={busy[ev._id] === "reject"} onClick={() => reject(ev)} style={{ color: "var(--color-danger)" }}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

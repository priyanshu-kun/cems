import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, IconButton } from "../components/Button.jsx";
import { Input, Segmented } from "../components/Form.jsx";
import { Card, Banner, EmptyState, Pill, Skeleton } from "../components/Primitives.jsx";
import * as AttendeesAPI from "../api/attendees.js";
import * as EventsAPI from "../api/events.js";
import * as UsersAPI from "../api/users.js";
import * as GuestsAPI from "../api/guests.js";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function AttendeesPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [data, setData] = useState(null);    // { items, students, guests, checkedIn }
  const [error, setError] = useState(null);
  const [picker, setPicker] = useState(null); // "STUDENT" | "GUEST" | null
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `Attendees · ${config.appName}`; }, []);

  const load = async () => {
    setData(null);
    setError(null);
    try {
      const [a, ev] = await Promise.all([
        AttendeesAPI.listAttendees(eventId),
        EventsAPI.getEvent(eventId).catch(() => null),
      ]);
      setData(a);
      setEvent(ev);
    } catch (e) {
      setError(errorMessage(e, "Couldn't load attendees."));
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId]);

  const addStudent = async (u) => {
    setBusy(true);
    try {
      await AttendeesAPI.addStudent(eventId, u._id);
      toast.success(`${u.fullName} added.`);
      setPicker(null);
      await load();
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't add student."));
    } finally { setBusy(false); }
  };

  const addGuest = async (g) => {
    setBusy(true);
    try {
      await AttendeesAPI.addGuest(eventId, g._id);
      toast.success(`${g.fullName} added.`);
      setPicker(null);
      await load();
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't add guest."));
    } finally { setBusy(false); }
  };

  const remove = async (row) => {
    setBusy(true);
    try {
      if (row.type === "STUDENT") await AttendeesAPI.removeStudent(eventId, row.id);
      else await AttendeesAPI.removeGuest(eventId, row.id);
      setData((d) => ({ ...d, items: d.items.filter((x) => !(x.type === row.type && x.id === row.id)) }));
      toast.success("Removed from event.");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't remove attendee."));
    } finally { setBusy(false); }
  };

  return (
    <div className="col gap-6">
      <header className="row gap-2">
        <IconButton icon="back" label="Back" onClick={() => navigate(-1)} />
        <div style={{ flex: 1 }}>
          <h1 className="t-display" style={{ margin: 0 }}>Attendees</h1>
          <div className="t-small">{event?.title || "Manage who's attending this event"}</div>
        </div>
      </header>

      {data ? (
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          <Pill status="PUBLISHED">{data.students} students</Pill>
          <Pill status="APPROVED">{data.guests} guests</Pill>
          <Pill status="ONGOING">{data.checkedIn} checked in</Pill>
        </div>
      ) : null}

      <div className="row gap-2">
        <Button variant="primary" leadingIcon="plus" onClick={() => setPicker("STUDENT")}>Add student</Button>
        <Button variant="secondary" leadingIcon="plus" onClick={() => setPicker("GUEST")}>Add guest</Button>
      </div>

      {error ? (
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      ) : null}

      {data === null ? (
        <Card className="card-flush">
          <div className="list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="row-item"><div className="col gap-2" style={{ flex: 1 }}><Skeleton w="40%" h={16} /><Skeleton w="55%" h={12} /></div></div>
            ))}
          </div>
        </Card>
      ) : data.items.length === 0 ? (
        <EmptyState icon="users" title="No attendees yet" body="Add enrolled students or registered guests to this event." />
      ) : (
        <Card className="card-flush">
          <div className="list">
            {data.items.map((row) => (
              <div key={`${row.type}-${row.id}`} className="row-item">
                <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                  <div className="row gap-2" style={{ alignItems: "center" }}>
                    <span className="t-strong truncate">{row.name}</span>
                    <Pill status={row.type === "GUEST" ? "APPROVED" : "PUBLISHED"}>{row.type === "GUEST" ? "Guest" : "Student"}</Pill>
                    {row.passStatus === "CONSUMED" ? <Pill status="ONGOING">Checked in</Pill> : null}
                  </div>
                  <div className="t-small truncate">{row.detail || row.email || "—"}</div>
                </div>
                <IconButton icon="x" label="Remove from event" onClick={() => remove(row)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {picker ? (
        <PickerModal
          kind={picker}
          busy={busy}
          onPick={picker === "STUDENT" ? addStudent : addGuest}
          onClose={() => setPicker(null)}
        />
      ) : null}
    </div>
  );
}

function PickerModal({ kind, onPick, onClose, busy }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);

  const search = async (term = q) => {
    setResults(null);
    try {
      if (kind === "STUDENT") {
        const res = await UsersAPI.listUsers({ role: "STUDENT", search: term || undefined, limit: 50 });
        setResults(res.items);
      } else {
        const res = await GuestsAPI.listGuests({ search: term || undefined, limit: 50 });
        setResults(res.items);
      }
    } catch (e) {
      toast.error(errorMessage(e, "Search failed."));
      setResults([]);
    }
  };

  useEffect(() => { search(""); /* eslint-disable-next-line */ }, []);

  return (
    <div className="modal-root" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{kind === "STUDENT" ? "Add a student" : "Add a guest"}</div>
        <div className="row gap-2 mt-3">
          <div style={{ flex: 1 }}>
            <Input value={q} onChange={setQ} placeholder={kind === "STUDENT" ? "Search students by name/email" : "Search guests"} />
          </div>
          <Button variant="secondary" onClick={() => search()}>Search</Button>
        </div>

        <div className="list mt-3" style={{ maxHeight: 320, overflowY: "auto" }}>
          {results === null ? (
            [1, 2, 3].map((i) => <div key={i} className="row-item"><Skeleton w="60%" h={16} /></div>)
          ) : results.length === 0 ? (
            <div className="t-small" style={{ padding: 12 }}>No matches.</div>
          ) : (
            results.map((r) => (
              <button key={r._id} className="row-item" disabled={busy} onClick={() => onPick(r)}>
                <div className="col gap-1" style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <span className="t-strong truncate">{r.fullName}</span>
                  <span className="t-small truncate">
                    {kind === "STUDENT"
                      ? [r.department, r.year && `Year ${r.year}`, r.email].filter(Boolean).join(" · ")
                      : [r.organization, r.email].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <span className="t-caption">Add</span>
              </button>
            ))
          )}
        </div>

        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

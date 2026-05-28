import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, IconButton } from "../components/Button.jsx";
import { Field, Input } from "../components/Form.jsx";
import { Card, Banner, EmptyState, Pill, Skeleton } from "../components/Primitives.jsx";
import * as GuestsAPI from "../api/guests.js";
import * as EventsAPI from "../api/events.js";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

const EMPTY_FORM = { fullName: "", email: "", phone: "", organization: "" };

export function GuestsPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [data, setData] = useState(null);     // { items, total, checkedIn }
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `Guests · ${config.appName}`; }, []);

  const load = async () => {
    setData(null);
    setError(null);
    try {
      const [g, ev] = await Promise.all([
        GuestsAPI.listGuests(eventId),
        EventsAPI.getEvent(eventId).catch(() => null),
      ]);
      setData(g);
      setEvent(ev);
    } catch (e) {
      setError(errorMessage(e, "Couldn't load guests."));
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [eventId]);

  const add = async () => {
    setFormErr(null);
    if (!form.fullName || form.fullName.trim().length < 2) return setFormErr("Guest name is required.");
    setBusy(true);
    try {
      const created = await GuestsAPI.addGuest(eventId, {
        fullName: form.fullName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        organization: form.organization.trim() || undefined,
      });
      setData((d) => ({ items: [created, ...d.items], total: d.total + 1, checkedIn: d.checkedIn }));
      toast.success("Guest added.");
      setForm(EMPTY_FORM);
      setAdding(false);
    } catch (e) {
      setFormErr(errorMessage(e, "Couldn't add guest."));
    } finally {
      setBusy(false);
    }
  };

  const checkIn = async (g) => {
    setBusy(true);
    try {
      const updated = await GuestsAPI.checkInGuest(eventId, g._id);
      setData((d) => ({
        ...d,
        items: d.items.map((x) => (x._id === updated._id ? updated : x)),
        checkedIn: d.checkedIn + 1,
      }));
      toast.success(`${updated.fullName} checked in.`);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't check in guest."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (g) => {
    setBusy(true);
    try {
      await GuestsAPI.removeGuest(eventId, g._id);
      setData((d) => ({
        items: d.items.filter((x) => x._id !== g._id),
        total: d.total - 1,
        checkedIn: d.checkedIn - (g.status === "CHECKED_IN" ? 1 : 0),
      }));
      toast.success("Guest removed.");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't remove guest."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col gap-6">
      <header className="row gap-2">
        <IconButton icon="back" label="Back" onClick={() => navigate(-1)} />
        <div style={{ flex: 1 }}>
          <h1 className="t-display" style={{ margin: 0 }}>Guests</h1>
          <div className="t-small">{event?.title || "External attendees for this event"}</div>
        </div>
        <Button variant="primary" leadingIcon="plus" onClick={() => setAdding((s) => !s)}>
          {adding ? "Close" : "Add guest"}
        </Button>
      </header>

      {data ? (
        <div className="row gap-2">
          <Pill status="APPROVED">{data.checkedIn} checked in</Pill>
          <Pill status="PUBLISHED">{data.total} total</Pill>
        </div>
      ) : null}

      {adding ? (
        <Card>
          <div className="t-strong">New guest</div>
          {formErr ? <Banner kind="danger">{formErr}</Banner> : null}
          <div className="col gap-3 mt-3">
            <Field label="Full name"><Input value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} placeholder="e.g. Rahul Mehta" /></Field>
            <div className="row gap-3">
              <Field label="Email (optional)"><Input type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="name@company.com" /></Field>
              <Field label="Phone (optional)"><Input value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+91 …" /></Field>
            </div>
            <Field label="Organization (optional)"><Input value={form.organization} onChange={(v) => setForm((f) => ({ ...f, organization: v }))} placeholder="e.g. PartnerCorp" /></Field>
            <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button variant="primary" loading={busy} onClick={add}>Add guest</Button>
            </div>
          </div>
        </Card>
      ) : null}

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
              <div key={i} className="row-item">
                <div className="col gap-2" style={{ flex: 1 }}><Skeleton w="45%" h={16} /><Skeleton w="60%" h={12} /></div>
              </div>
            ))}
          </div>
        </Card>
      ) : data.items.length === 0 ? (
        <EmptyState icon="users" title="No guests yet" body="Add external attendees who don't have a student account." />
      ) : (
        <Card className="card-flush">
          <div className="list">
            {data.items.map((g) => (
              <div key={g._id} className="row-item">
                <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                  <div className="row gap-2" style={{ alignItems: "center" }}>
                    <span className="t-strong truncate">{g.fullName}</span>
                    {g.status === "CHECKED_IN" ? <Pill status="APPROVED">Checked in</Pill> : null}
                    {g.status === "CANCELLED" ? <Pill status="CANCELLED">Cancelled</Pill> : null}
                  </div>
                  <div className="t-small truncate">
                    {[g.organization, g.email, g.phone].filter(Boolean).join(" · ") || "No contact details"}
                  </div>
                </div>
                <div className="row gap-2">
                  {g.status !== "CHECKED_IN" ? (
                    <Button variant="secondary" leadingIcon="check" loading={busy} onClick={() => checkIn(g)}>Check in</Button>
                  ) : null}
                  <IconButton icon="x" label="Remove guest" onClick={() => remove(g)} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

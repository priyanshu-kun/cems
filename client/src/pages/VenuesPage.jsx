import { useEffect, useState } from "react";
import { Button } from "../components/Button.jsx";
import { Field, Input } from "../components/Form.jsx";
import { Card, Banner, EmptyState, Pill, Skeleton } from "../components/Primitives.jsx";
import { Icon } from "../components/Icon.jsx";
import * as VenuesAPI from "../api/venues.js";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

const EMPTY_FORM = { name: "", building: "", capacity: "", facilities: "" };

export function VenuesPage() {
  const toast = useToast();

  const [venues, setVenues] = useState(null);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);   // venue being edited, or "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `Venues · ${config.appName}`; }, []);

  const load = async () => {
    setVenues(null);
    setError(null);
    try {
      setVenues(await VenuesAPI.listVenues({ includeInactive: true }));
    } catch (e) {
      setError(errorMessage(e, "Couldn't load venues."));
    }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditor("new"); setForm(EMPTY_FORM); setFormErr(null); };
  const openEdit = (v) => {
    setEditor(v);
    setForm({
      name: v.name || "",
      building: v.building || "",
      capacity: String(v.capacity ?? ""),
      facilities: (v.facilities || []).join(", "),
    });
    setFormErr(null);
  };
  const close = () => { setEditor(null); setForm(EMPTY_FORM); setFormErr(null); };

  const save = async () => {
    setFormErr(null);
    if (!form.name || form.name.trim().length < 2) return setFormErr("Name is required.");
    if (!form.capacity || Number(form.capacity) < 1) return setFormErr("Capacity must be at least 1.");
    const payload = {
      name: form.name.trim(),
      building: form.building.trim() || undefined,
      capacity: Number(form.capacity),
      facilities: form.facilities
        ? form.facilities.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
    };
    setBusy(true);
    try {
      if (editor === "new") {
        const created = await VenuesAPI.createVenue(payload);
        setVenues((arr) => [created, ...(arr || [])].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Venue added.");
      } else {
        const updated = await VenuesAPI.updateVenue(editor._id, payload);
        setVenues((arr) => arr.map((x) => (x._id === updated._id ? updated : x)));
        toast.success("Venue updated.");
      }
      close();
    } catch (e) {
      setFormErr(errorMessage(e, "Couldn't save venue."));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (v) => {
    setBusy(true);
    try {
      const updated = await VenuesAPI.deactivateVenue(v._id);
      setVenues((arr) => arr.map((x) => (x._id === updated._id ? updated : x)));
      toast.success("Venue deactivated.");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't deactivate venue."));
    } finally {
      setBusy(false);
    }
  };

  const reactivate = async (v) => {
    setBusy(true);
    try {
      const updated = await VenuesAPI.updateVenue(v._id, { isActive: true });
      setVenues((arr) => arr.map((x) => (x._id === updated._id ? updated : x)));
      toast.success("Venue reactivated.");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't reactivate venue."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Venues</h1>
          <div className="t-small">Rooms and halls events can be booked into.</div>
        </div>
        <Button variant="primary" leadingIcon="plus" onClick={openNew}>New venue</Button>
      </header>

      {error ? (
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      ) : null}

      {venues === null ? (
        <Card className="card-flush">
          <div className="list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="row-item">
                <div className="col gap-2" style={{ flex: 1 }}><Skeleton w="50%" h={16} /><Skeleton w="35%" h={12} /></div>
              </div>
            ))}
          </div>
        </Card>
      ) : venues.length === 0 ? (
        <EmptyState icon="map-pin" title="No venues yet" body="Add your first venue so organizers can schedule events." />
      ) : (
        <Card className="card-flush">
          <div className="list">
            {venues.map((v) => (
              <div key={v._id} className="row-item">
                <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                  <div className="row gap-2" style={{ alignItems: "center" }}>
                    <span className="t-strong">{v.name}</span>
                    {v.isActive === false ? <Pill status="COMPLETED">Inactive</Pill> : null}
                  </div>
                  <div className="t-small">
                    {v.building ? `${v.building} · ` : ""}Capacity {v.capacity}
                    {v.facilities?.length ? ` · ${v.facilities.join(", ")}` : ""}
                  </div>
                </div>
                <div className="row gap-2">
                  <Button variant="ghost" leadingIcon="edit" onClick={() => openEdit(v)}>Edit</Button>
                  {v.isActive === false ? (
                    <Button variant="secondary" onClick={() => reactivate(v)} disabled={busy}>Reactivate</Button>
                  ) : (
                    <Button variant="ghost" onClick={() => deactivate(v)} disabled={busy}>Deactivate</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {editor ? (
        <div className="modal-root" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editor === "new" ? "New venue" : "Edit venue"}</div>
            {formErr ? <Banner kind="danger">{formErr}</Banner> : null}
            <div className="col gap-3 mt-3">
              <Field label="Name"><Input value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Main Auditorium" /></Field>
              <div className="row gap-3">
                <Field label="Building (optional)"><Input value={form.building} onChange={(v) => setForm((f) => ({ ...f, building: v }))} placeholder="e.g. A Block" /></Field>
                <Field label="Capacity"><Input type="number" inputMode="numeric" value={form.capacity} onChange={(v) => setForm((f) => ({ ...f, capacity: v }))} placeholder="0" /></Field>
              </div>
              <Field label="Facilities (optional)" helper="Comma-separated, e.g. wifi, projector, ac">
                <Input value={form.facilities} onChange={(v) => setForm((f) => ({ ...f, facilities: v }))} placeholder="wifi, projector, ac" />
              </Field>
            </div>
            <div className="modal-actions">
              <Button variant="primary" loading={busy} onClick={save}>{editor === "new" ? "Create venue" : "Save changes"}</Button>
              <Button variant="ghost" onClick={close}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

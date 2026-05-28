import { useEffect, useState } from "react";
import { Button, IconButton } from "../components/Button.jsx";
import { Field, Input } from "../components/Form.jsx";
import { Card, Banner, EmptyState, Skeleton } from "../components/Primitives.jsx";
import * as GuestsAPI from "../api/guests.js";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

const EMPTY_FORM = { fullName: "", email: "", phone: "", organization: "" };

export function GuestsPage() {
  const toast = useToast();

  const [data, setData] = useState(null);    // { items, total }
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState(null); // guest being edited, or "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = `Guests · ${config.appName}`; }, []);

  const load = async (q = search) => {
    setData(null);
    setError(null);
    try {
      setData(await GuestsAPI.listGuests({ search: q || undefined, limit: 100 }));
    } catch (e) {
      setError(errorMessage(e, "Couldn't load guests."));
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openNew = () => { setEditor("new"); setForm(EMPTY_FORM); setFormErr(null); };
  const openEdit = (g) => {
    setEditor(g);
    setForm({ fullName: g.fullName || "", email: g.email || "", phone: g.phone || "", organization: g.organization || "" });
    setFormErr(null);
  };
  const close = () => { setEditor(null); setForm(EMPTY_FORM); setFormErr(null); };

  const save = async () => {
    setFormErr(null);
    if (!form.fullName || form.fullName.trim().length < 2) return setFormErr("Name is required.");
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      organization: form.organization.trim() || undefined,
    };
    setBusy(true);
    try {
      if (editor === "new") {
        const created = await GuestsAPI.createGuest(payload);
        setData((d) => ({ ...d, items: [created, ...d.items], total: d.total + 1 }));
        toast.success("Guest added to registry.");
      } else {
        const updated = await GuestsAPI.updateGuest(editor._id, payload);
        setData((d) => ({ ...d, items: d.items.map((x) => (x._id === updated._id ? updated : x)) }));
        toast.success("Guest updated.");
      }
      close();
    } catch (e) {
      setFormErr(errorMessage(e, "Couldn't save guest."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (g) => {
    setBusy(true);
    try {
      await GuestsAPI.deleteGuest(g._id);
      setData((d) => ({ ...d, items: d.items.filter((x) => x._id !== g._id), total: d.total - 1 }));
      toast.success("Guest removed from registry.");
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't remove guest."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Guests</h1>
          <div className="t-small">College-wide list of external attendees. Add them to events from the event's attendees screen.</div>
        </div>
        <Button variant="primary" leadingIcon="plus" onClick={openNew}>New guest</Button>
      </header>

      <Card>
        <div className="row gap-3" style={{ alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div className="t-small" style={{ marginBottom: 6 }}>Search</div>
            <Input value={search} onChange={setSearch} placeholder="Name, email or organization" />
          </div>
          <Button variant="secondary" onClick={() => load()}>Search</Button>
        </div>
      </Card>

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
              <div key={i} className="row-item"><div className="col gap-2" style={{ flex: 1 }}><Skeleton w="45%" h={16} /><Skeleton w="60%" h={12} /></div></div>
            ))}
          </div>
        </Card>
      ) : data.items.length === 0 ? (
        <EmptyState icon="users" title="No guests yet" body="Add external people (alumni, speakers, partners) to invite them to events." />
      ) : (
        <Card className="card-flush">
          <div className="list">
            {data.items.map((g) => (
              <div key={g._id} className="row-item">
                <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                  <span className="t-strong truncate">{g.fullName}</span>
                  <div className="t-small truncate">
                    {[g.organization, g.email, g.phone].filter(Boolean).join(" · ") || "No contact details"}
                  </div>
                </div>
                <div className="row gap-2">
                  <Button variant="ghost" leadingIcon="edit" onClick={() => openEdit(g)}>Edit</Button>
                  <IconButton icon="x" label="Remove guest" onClick={() => remove(g)} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {editor ? (
        <div className="modal-root" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editor === "new" ? "New guest" : "Edit guest"}</div>
            {formErr ? <Banner kind="danger">{formErr}</Banner> : null}
            <div className="col gap-3 mt-3">
              <Field label="Full name"><Input value={form.fullName} onChange={(v) => setForm((f) => ({ ...f, fullName: v }))} placeholder="e.g. Rahul Mehta" /></Field>
              <div className="row gap-3">
                <Field label="Email (optional)"><Input type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="name@company.com" /></Field>
                <Field label="Phone (optional)"><Input value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+91 …" /></Field>
              </div>
              <Field label="Organization (optional)"><Input value={form.organization} onChange={(v) => setForm((f) => ({ ...f, organization: v }))} placeholder="e.g. PartnerCorp" /></Field>
            </div>
            <div className="modal-actions">
              <Button variant="primary" loading={busy} onClick={save}>{editor === "new" ? "Add guest" : "Save changes"}</Button>
              <Button variant="ghost" onClick={close}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

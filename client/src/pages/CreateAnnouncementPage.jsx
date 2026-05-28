import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, IconButton } from "../components/Button.jsx";
import { Field, Input, Select, Textarea, Chips } from "../components/Form.jsx";
import { Card, Banner } from "../components/Primitives.jsx";
import * as EventsAPI from "../api/events.js";
import * as MarketingAPI from "../api/marketing.js";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function CreateAnnouncementPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "", body: "", eventId: "",
    isPinned: false,
    departments: [], years: [], roles: [],
  });
  const [linkableEvents, setLinkableEvents] = useState([]);
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = `New announcement · ${config.appName}`; }, []);

  useEffect(() => {
    EventsAPI.listEvents({ limit: 100 }).then((data) => {
      const items = (data.items || []).filter((e) => ["APPROVED", "PUBLISHED", "ONGOING"].includes(e.status));
      setLinkableEvents(items);
    }).catch(() => { /* non-fatal */ });
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e?.preventDefault?.();
    const errs = {};
    if (!form.title || form.title.trim().length < 3) errs.title = "Add a title (3+ chars).";
    if (!form.body || form.body.trim().length < 3) errs.body = "Add a short message.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setTopError(null);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        eventId: form.eventId || undefined,
        isPinned: !!form.isPinned,
        targetAudience: {
          departments: form.departments,
          years: form.years.map(Number).filter(Number.isFinite),
          roles: form.roles,
        },
      };
      await MarketingAPI.createAnnouncement(payload);
      toast.success("Announcement published.");
      navigate(-1);
    } catch (err) {
      setTopError(errorMessage(err, "Couldn't publish announcement."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="col gap-6" onSubmit={submit} noValidate>
      <header className="row gap-2">
        <IconButton icon="back" label="Back" onClick={() => navigate(-1)} />
        <h1 className="t-display" style={{ margin: 0 }}>New announcement</h1>
      </header>

      {topError ? <Banner kind="danger">{topError}</Banner> : null}

      <Card>
        <div className="col gap-4">
          <Field label="Title" error={errors.title} htmlFor="an-title">
            <Input id="an-title" value={form.title} onChange={(v) => set("title", v)} placeholder="e.g. Last call for hackathon teams" />
          </Field>

          <Field label="Message" error={errors.body} htmlFor="an-body">
            <Textarea id="an-body" value={form.body} onChange={(v) => set("body", v)} rows={4}
              placeholder="What do you want everyone to know?" />
          </Field>

          <Field label="Link to event (optional)">
            <Select
              value={form.eventId}
              onChange={(v) => set("eventId", v)}
              options={linkableEvents.map((e) => ({ value: e._id, label: e.title }))}
              placeholder="No linked event"
            />
          </Field>

          <label className="row gap-2" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPinned} onChange={(e) => set("isPinned", e.target.checked)} />
            <span className="t-body">Pin to top of the feed</span>
          </label>
        </div>
      </Card>

      <Card>
        <div className="t-strong">Target audience</div>
        <div className="t-small" style={{ marginTop: 4 }}>Empty = everyone.</div>
        <div className="col gap-4 mt-3">
          <div>
            <div className="t-small" style={{ marginBottom: 6 }}>Departments</div>
            <Chips options={config.departments} value={form.departments} onChange={(v) => set("departments", v)} />
          </div>
          <div>
            <div className="t-small" style={{ marginBottom: 6 }}>Years</div>
            <Chips
              options={config.years.map((y) => ({ value: y, label: `Year ${y}` }))}
              value={form.years}
              onChange={(v) => set("years", v)}
            />
          </div>
          <div>
            <div className="t-small" style={{ marginBottom: 6 }}>Roles</div>
            <Chips
              options={[
                { value: "STUDENT", label: "Students" },
                { value: "ORGANIZER", label: "Organizers" },
                { value: "ADMIN", label: "Admins" },
              ]}
              value={form.roles}
              onChange={(v) => set("roles", v)}
            />
          </div>
        </div>
      </Card>

      <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
        <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
        <Button variant="primary" type="submit" loading={loading}>Publish</Button>
      </div>
    </form>
  );
}

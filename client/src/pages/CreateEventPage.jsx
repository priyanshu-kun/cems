import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, IconButton } from "../components/Button.jsx";
import { Field, Input, Select, Textarea, Chips } from "../components/Form.jsx";
import { Card, Banner } from "../components/Primitives.jsx";
import { Icon } from "../components/Icon.jsx";
import * as EventsAPI from "../api/events.js";
import * as VenuesAPI from "../api/venues.js";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function CreateEventPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: "", description: "", venueId: "",
    startTime: "", endTime: "",
    capacity: "",
    tags: [],
    departments: [], years: [], roles: [],
    audienceOpen: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [topError, setTopError] = useState(null);

  // Venues are fetched live from the backend.
  const [venues, setVenues] = useState(null);  // null = loading, [] = none
  const [venuesError, setVenuesError] = useState(false);

  useEffect(() => { document.title = `Create event · ${config.appName}`; }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await VenuesAPI.listVenues();
        if (alive) setVenues(list);
      } catch {
        if (alive) { setVenues([]); setVenuesError(true); }
      }
    })();
    return () => { alive = false; };
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.title || form.title.trim().length < 3) errs.title = "Give your event a title (3+ chars).";
    if (!form.description || form.description.trim().length < 3) errs.description = "Add a short description.";
    if (!form.venueId) errs.venueId = "Pick a venue.";
    if (!form.startTime) errs.startTime = "Set a start time.";
    if (!form.endTime) errs.endTime = "Set an end time.";
    else if (form.startTime && new Date(form.endTime) <= new Date(form.startTime)) errs.endTime = "Must be after start time.";
    if (!form.capacity || Number(form.capacity) <= 0) errs.capacity = "Capacity must be greater than zero.";
    return errs;
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setTopError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        venueId: form.venueId.trim(),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        capacity: Number(form.capacity),
        tags: form.tags,
        targetAudience: {
          departments: form.departments,
          years: form.years.map(Number).filter(Number.isFinite),
          roles: form.roles,
        },
      };
      const created = await EventsAPI.createEvent(payload);
      toast.success("Event submitted for approval.");
      navigate(`/events/${created._id}`);
    } catch (err) {
      setTopError(errorMessage(err, "Couldn't create event."));
      if (err?.details) {
        const fieldErrs = {};
        Object.entries(err.details).forEach(([k, v]) => { fieldErrs[k.split(".").pop()] = v; });
        setErrors(fieldErrs);
      }
    } finally {
      setLoading(false);
    }
  };

  const venuesLoading = venues === null;
  const hasVenueOptions = Array.isArray(venues) && venues.length > 0;

  return (
    <form className="col gap-6" onSubmit={submit} noValidate>
      <header className="row gap-2">
        <IconButton icon="back" label="Back" onClick={() => navigate(-1)} />
        <h1 className="t-display" style={{ margin: 0 }}>New event</h1>
      </header>

      {topError ? <Banner kind="danger">{topError}</Banner> : null}

      <Card>
        <div className="col gap-4">
          <Field label="Title" error={errors.title} htmlFor="ev-title">
            <Input id="ev-title" value={form.title} onChange={(v) => set("title", v)} placeholder="e.g. Robotics Workshop" />
          </Field>

          <Field
            label="Description"
            error={errors.description}
            htmlFor="ev-desc"
            helper="A short paragraph students will read on the event page."
          >
            <Textarea id="ev-desc" value={form.description} onChange={(v) => set("description", v)}
              placeholder="What is this event about? Who is it for? What should they bring?" rows={5} />
          </Field>

          <Field
            label="Venue"
            error={errors.venueId}
            htmlFor="ev-venue"
            helper={
              venuesLoading
                ? "Loading venues…"
                : hasVenueOptions
                  ? null
                  : venuesError
                    ? "Couldn't load venues. Type a venue ID, or ask an admin to add venues."
                    : "No venues yet — ask an admin to add one under Venues."
            }
          >
            {hasVenueOptions ? (
              <Select
                id="ev-venue"
                value={form.venueId}
                onChange={(v) => set("venueId", v)}
                options={venues.map((v) => ({
                  value: v._id,
                  label: `${v.name}${v.building ? ` · ${v.building}` : ""} (cap ${v.capacity})`,
                }))}
                placeholder="Choose a venue"
              />
            ) : (
              <Input
                id="ev-venue"
                value={form.venueId}
                onChange={(v) => set("venueId", v)}
                placeholder={venuesLoading ? "Loading…" : "Venue ID"}
                disabled={venuesLoading}
              />
            )}
          </Field>

          <div className="row gap-3" style={{ alignItems: "flex-start" }}>
            <Field label="Start" error={errors.startTime} htmlFor="ev-start">
              <input
                id="ev-start"
                className="input"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </Field>
            <Field label="End" error={errors.endTime} htmlFor="ev-end">
              <input
                id="ev-end"
                className="input"
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Capacity" error={errors.capacity} htmlFor="ev-cap">
            <Input id="ev-cap" type="number" inputMode="numeric" value={form.capacity} onChange={(v) => set("capacity", v)} placeholder="e.g. 100" />
          </Field>

          <Field label="Tags (optional)" helper="Press enter or comma to add.">
            <TagInput value={form.tags} onChange={(v) => set("tags", v)} />
          </Field>
        </div>
      </Card>

      <Card>
        <button
          type="button"
          className="row-between"
          style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", width: "100%" }}
          onClick={() => set("audienceOpen", !form.audienceOpen)}
        >
          <div style={{ textAlign: "left" }}>
            <div className="t-strong">Target audience</div>
            <div className="t-small">
              {form.departments.length + form.years.length + form.roles.length === 0
                ? "Everyone"
                : "Limited audience"}
            </div>
          </div>
          <Icon
            name="chevron-down"
            color="var(--color-text-secondary)"
            // inline rotation; safer than inline transform clobbering the .input style
            // (we don't use a style override here, just leave as-is — the chevron is fine static)
          />
        </button>

        {form.audienceOpen ? (
          <div className="col gap-4 mt-4">
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
            <div className="t-caption">Empty = everyone.</div>
          </div>
        ) : null}
      </Card>

      <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
        <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
        <Button variant="primary" type="submit" loading={loading}>Submit for approval</Button>
      </div>
    </form>
  );
}

function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim().replace(/^#/, "");
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  return (
    <div>
      <div className="chips" style={{ marginBottom: value.length ? 8 : 0 }}>
        {value.map((t) => (
          <span key={t} className="chip" aria-pressed="true" style={{ cursor: "default" }}>
            #{t}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== t))}
              style={{ background: "transparent", border: 0, cursor: "pointer", color: "inherit", padding: 0, display: "inline-flex" }}
              aria-label={`Remove ${t}`}
            >
              <Icon name="x" size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        className="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
        }}
        onBlur={add}
        placeholder="e.g. hackathon"
      />
    </div>
  );
}

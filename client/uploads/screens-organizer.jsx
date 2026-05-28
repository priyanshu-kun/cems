// CEMS — Organizer forms: Create Event, Create Announcement

function CreateEventScreen({ ctx, demoState = "default" }) {
  const { data, pop, toast, setEvents, user } = ctx;
  const [form, setForm] = React.useState({
    title: "", description: "", venueId: "",
    start: "", end: "",
    capacity: "",
    tags: [], showAudience: false,
    departments: [], years: [], roles: [],
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [conflict, setConflict] = React.useState(demoState === "error");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const venueObj = data.venues.find(v => v.id === form.venueId);

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = "Give your event a title.";
    if (!form.description) errs.description = "Add a short description.";
    if (!form.venueId) errs.venueId = "Pick a venue.";
    if (!form.start) errs.start = "Set a start time.";
    if (!form.end) errs.end = "Set an end time.";
    else if (form.start && new Date(form.end) <= new Date(form.start)) errs.end = "Must be after start time.";
    if (!form.capacity || +form.capacity <= 0) errs.capacity = "Capacity must be greater than zero.";
    else if (venueObj && +form.capacity > venueObj.capacity) errs.capacity = `Venue allows up to ${venueObj.capacity}.`;
    return errs;
  };

  const onSubmit = (status) => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setConflict(false);
    setTimeout(() => {
      setLoading(false);
      const newEvent = {
        id: "ev_" + Math.random().toString(36).slice(2,7),
        title: form.title,
        description: form.description,
        venueId: form.venueId,
        venueName: venueObj.name,
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
        capacity: +form.capacity,
        rsvpCount: 0,
        status,
        tags: form.tags,
        organizerId: user.id,
        organizerName: user.name,
        audience: { departments: form.departments, years: form.years, roles: form.roles },
      };
      setEvents(evs => [newEvent, ...evs]);
      toast({kind:"success", text: status === "DRAFT" ? "Saved as draft." : "Event submitted for approval."});
      pop();
    }, 700);
  };

  return (
    <div className="scroll">
      {conflict ? (
        <Banner kind="danger">This venue is already booked for this time slot. Choose a different time or venue.</Banner>
      ) : null}

      <Field label="Title" error={errors.title} htmlFor="ev-title">
        <Input id="ev-title" value={form.title} onChange={v => set("title", v)} placeholder="e.g. Robotics Workshop" />
      </Field>

      <Field label="Description" error={errors.description} htmlFor="ev-desc"
             helper="A short paragraph students will read on the event page.">
        <Textarea id="ev-desc" value={form.description} onChange={v => set("description", v)}
                  placeholder="What is this event about? Who is it for? What should they bring?" rows={5} />
      </Field>

      <Field label="Venue" error={errors.venueId}
             helper={data.venues.length === 0 ? "Ask an admin to add a venue." : venueObj ? `Venue allows up to ${venueObj.capacity}.` : null}>
        <Select value={form.venueId} onChange={v => set("venueId", v)}
                options={data.venues.map(v => ({ value: v.id, label: `${v.name} · up to ${v.capacity}` }))}
                placeholder="Choose a venue" disabled={data.venues.length === 0} />
      </Field>

      <div className="row gap-3">
        <Field label="Start" error={errors.start} htmlFor="ev-start">
          <input id="ev-start" className="input" type="datetime-local"
                 value={form.start} onChange={e => set("start", e.target.value)} />
        </Field>
        <Field label="End" error={errors.end} htmlFor="ev-end">
          <input id="ev-end" className="input" type="datetime-local"
                 value={form.end} onChange={e => set("end", e.target.value)} />
        </Field>
      </div>

      <Field label="Capacity" error={errors.capacity}
             helper={venueObj ? `Venue allows up to ${venueObj.capacity}.` : "How many students can RSVP."} htmlFor="ev-cap">
        <Input id="ev-cap" type="number" inputMode="numeric" value={form.capacity} onChange={v => set("capacity", v)} placeholder="e.g. 100" />
      </Field>

      <Field label="Tags (optional)" helper="Press enter or comma to add.">
        <TagInput value={form.tags} onChange={v => set("tags", v)} />
      </Field>

      <Card className="col gap-3">
        <button className="row-between" style={{background:"transparent", border:0, padding:0, cursor:"pointer", width:"100%"}}
                onClick={() => set("showAudience", !form.showAudience)}>
          <div style={{textAlign:"left"}}>
            <div className="t-strong">Target audience</div>
            <div className="t-small">{form.departments.length + form.years.length + form.roles.length === 0 ? "Everyone" : "Limited audience"}</div>
          </div>
          <Icon name="chevron-down" style={{transform: form.showAudience ? "rotate(180deg)" : "none", transition: "transform 150ms ease-out"}} color="var(--color-text-secondary)" />
        </button>
        {form.showAudience ? (
          <div className="col gap-4">
            <div>
              <div className="t-small mt-2" style={{marginBottom: 6}}>Departments</div>
              <Chips options={window.CEMS_DATA.DEPARTMENTS} value={form.departments} onChange={v => set("departments", v)} />
            </div>
            <div>
              <div className="t-small" style={{marginBottom: 6}}>Years</div>
              <Chips options={window.CEMS_DATA.YEARS.map(y => ({value: y, label: `Year ${y}`}))} value={form.years} onChange={v => set("years", v)} />
            </div>
            <div>
              <div className="t-small" style={{marginBottom: 6}}>Roles</div>
              <Chips options={[{value:"STUDENT", label:"Students"},{value:"ORGANIZER", label:"Organizers"},{value:"ADMIN", label:"Admins"}]}
                     value={form.roles} onChange={v => set("roles", v)} />
            </div>
            <div className="t-caption">Empty = everyone.</div>
          </div>
        ) : null}
      </Card>

      <div className="col gap-2 mt-2">
        <Button variant="primary" block loading={loading} onClick={() => onSubmit("PENDING_APPROVAL")}>Submit for approval</Button>
        <Button variant="ghost" block onClick={() => onSubmit("DRAFT")}>Save as draft</Button>
      </div>
    </div>
  );
}

function TagInput({ value = [], onChange }) {
  const [input, setInput] = React.useState("");
  const add = () => {
    const t = input.trim().replace(/^#/, "");
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  return (
    <div>
      <div className="chips" style={{marginBottom: value.length ? 8 : 0}}>
        {value.map(t => (
          <span key={t} className="chip" aria-pressed="true" style={{cursor:"default"}}>
            #{t}
            <button onClick={() => onChange(value.filter(x => x !== t))} style={{background:"transparent",border:0,cursor:"pointer",color:"inherit",padding:0,display:"inline-flex"}} aria-label={`Remove ${t}`}><Icon name="x" size={14} /></button>
          </span>
        ))}
      </div>
      <input className="input" value={input} onChange={e => setInput(e.target.value)}
             onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
             onBlur={add}
             placeholder="e.g. hackathon" />
    </div>
  );
}

function CreateAnnouncementScreen({ ctx }) {
  const { data, pop, toast, setAnnouncements, user } = ctx;
  const [form, setForm] = React.useState({ title: "", body: "", eventId: "", departments: [], years: [] });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const errs = {};
    if (!form.title) errs.title = "Add a title.";
    if (!form.body) errs.body = "Add a short message.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnnouncements(a => [{
        id: "an_" + Math.random().toString(36).slice(2,6),
        title: form.title, body: form.body,
        eventId: form.eventId || null,
        postedBy: user.name,
        postedAt: new Date().toISOString(),
      }, ...a]);
      toast({kind:"success", text:"Announcement published."});
      pop();
    }, 600);
  };

  const linkable = data.events.filter(e => ["APPROVED","PUBLISHED","ONGOING"].includes(e.status));

  return (
    <div className="scroll">
      <Field label="Title" error={errors.title} htmlFor="an-title">
        <Input id="an-title" value={form.title} onChange={v => set("title", v)} placeholder="e.g. Last call for hackathon teams" />
      </Field>
      <Field label="Message" error={errors.body} htmlFor="an-body">
        <Textarea id="an-body" value={form.body} onChange={v => set("body", v)} rows={4}
                  placeholder="What do you want everyone to know?" />
      </Field>
      <Field label="Link to event (optional)">
        <Select value={form.eventId} onChange={v => set("eventId", v)}
                options={linkable.map(e => ({ value: e.id, label: e.title }))}
                placeholder="No linked event" />
      </Field>

      <Card className="col gap-3">
        <div className="t-strong">Target audience</div>
        <div>
          <div className="t-small" style={{marginBottom: 6}}>Departments</div>
          <Chips options={window.CEMS_DATA.DEPARTMENTS} value={form.departments} onChange={v => set("departments", v)} />
        </div>
        <div>
          <div className="t-small" style={{marginBottom: 6}}>Years</div>
          <Chips options={window.CEMS_DATA.YEARS.map(y => ({value: y, label: `Year ${y}`}))} value={form.years} onChange={v => set("years", v)} />
        </div>
        <div className="t-caption">Empty = everyone.</div>
      </Card>

      <Button variant="primary" block loading={loading} onClick={submit}>Publish</Button>
    </div>
  );
}

Object.assign(window, { CreateEventScreen, CreateAnnouncementScreen });

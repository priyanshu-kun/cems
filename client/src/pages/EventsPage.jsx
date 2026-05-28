import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Segmented } from "../components/Form.jsx";
import { Banner, EmptyState, SkelEventCard } from "../components/Primitives.jsx";
import { EventCard } from "../components/EventCard.jsx";
import * as EventsAPI from "../api/events.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useRsvps } from "../hooks/useLocalStore.js";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

const STUDENT_FILTERS = [
  { value: "PUBLISHED", label: "Published" },
  { value: "ONGOING", label: "Live" },
  { value: "COMPLETED", label: "Past" },
];

const ADMIN_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "APPROVED", label: "Approved" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ONGOING", label: "Live" },
  { value: "COMPLETED", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function EventsPage() {
  const { effectiveRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { has: hasRsvp, add: addRsvp, remove: removeRsvp } = useRsvps();

  const filters = effectiveRole === "ADMIN" ? ADMIN_FILTERS : STUDENT_FILTERS;
  const [status, setStatus] = useState(filters[0].value);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({});

  useEffect(() => { document.title = `Events · ${config.appName}`; }, []);

  const load = async () => {
    setEvents(null);
    setError(null);
    try {
      const data = await EventsAPI.listEvents({
        status: status === "ALL" ? undefined : status,
        limit: config.pageSize,
      });
      setEvents(data.items || []);
    } catch (e) {
      setError(errorMessage(e, "Couldn't load events."));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const toggleRsvp = async (ev) => {
    setBusy((b) => ({ ...b, [ev._id]: true }));
    try {
      if (hasRsvp(ev._id)) {
        await EventsAPI.cancelRsvp(ev._id);
        removeRsvp(ev._id);
        setEvents((arr) => arr.map((x) => (x._id === ev._id ? { ...x, rsvpCount: Math.max(0, (x.rsvpCount || 0) - 1) } : x)));
        toast.info("RSVP cancelled.");
      } else {
        await EventsAPI.rsvp(ev._id);
        addRsvp(ev._id);
        setEvents((arr) => arr.map((x) => (x._id === ev._id ? { ...x, rsvpCount: (x.rsvpCount || 0) + 1 } : x)));
        toast.success("You're going.");
      }
    } catch (e) {
      toast.error(errorMessage(e, "RSVP failed."));
    } finally {
      setBusy((b) => ({ ...b, [ev._id]: false }));
    }
  };

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>
            {effectiveRole === "ADMIN" ? "All events" : "Browse events"}
          </h1>
          <div className="t-small">
            {effectiveRole === "ADMIN"
              ? "Filter by status to find what you need."
              : "Find something to go to this week."}
          </div>
        </div>
        <Segmented options={filters} value={status} onChange={setStatus} />
      </header>

      {error ? (
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      ) : null}

      {events === null ? (
        <div className="grid-events">
          <SkelEventCard /><SkelEventCard /><SkelEventCard /><SkelEventCard />
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon="calendar-empty" title="No events here" body="Try a different filter." />
      ) : (
        <div className="grid-events">
          {events.map((ev) => (
            <EventCard
              key={ev._id}
              event={ev}
              rsvped={hasRsvp(ev._id)}
              busy={!!busy[ev._id]}
              onToggleRsvp={effectiveRole === "STUDENT" || effectiveRole === "ORGANIZER" ? toggleRsvp : undefined}
              onOpen={() => navigate(`/events/${ev._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

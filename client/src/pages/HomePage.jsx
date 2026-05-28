import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import { Banner, EmptyState, SkelEventCard, Skeleton } from "../components/Primitives.jsx";
import { EventCard } from "../components/EventCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import * as EventsAPI from "../api/events.js";
import * as MarketingAPI from "../api/marketing.js";
import { useRsvps } from "../hooks/useLocalStore.js";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function HomePage() {
  const { user, effectiveRole } = useAuth();
  const { ids: rsvpIds, has: hasRsvp, add: addRsvp, remove: removeRsvp } = useRsvps();
  const toast = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({}); // per-event button busy state

  const firstName = (user?.fullName || user?.name || "there").split(" ")[0];

  useEffect(() => { document.title = `Home · ${config.appName}`; }, []);

  const load = async () => {
    setError(null);
    setEvents(null);
    setAnnouncements(null);
    try {
      const [evs, feed] = await Promise.all([
        EventsAPI.listEvents({ status: "PUBLISHED", limit: config.pageSize }),
        MarketingAPI.feed({ limit: 6 }).catch(() => ({ items: [] })),
      ]);
      setEvents(evs.items || []);
      setAnnouncements(feed.items || []);
    } catch (e) {
      setError(errorMessage(e, "Couldn't load the home page."));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

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
        toast.success("You're going. Pass available in My Pass.");
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
          <h1 className="t-display" style={{ margin: 0 }}>Hi, {firstName}</h1>
          <div className="t-small">Here's what's happening on campus.</div>
        </div>
        <div className="page-header-actions">
          {effectiveRole !== "STUDENT" ? (
            <Button variant="secondary" leadingIcon="megaphone" onClick={() => navigate("/create-announcement")}>
              New announcement
            </Button>
          ) : null}
          {effectiveRole !== "STUDENT" ? (
            <Button variant="primary" leadingIcon="plus" onClick={() => navigate("/create-event")}>
              Create event
            </Button>
          ) : null}
        </div>
      </header>

      {error ? (
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      ) : null}

      {/* Announcements */}
      <section>
        <div className="section-head">
          <h2>Announcements</h2>
        </div>
        {announcements === null ? (
          <div className="announce-rail">
            {[1, 2, 3].map((i) => (
              <div key={i} className="announce-card is-static">
                <Skeleton w="40%" h={12} />
                <Skeleton w="90%" h={16} />
                <Skeleton w="60%" h={14} />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState icon="megaphone" body="No announcements right now." />
        ) : (
          <div className="announce-rail">
            {announcements.slice(0, 6).map((a) => (
              <button
                key={a._id}
                className="announce-card"
                onClick={() => a.eventId && navigate(`/events/${a.eventId}`)}
              >
                <div className="t-caption" style={{ color: "var(--color-primary)" }}>
                  {a.authorName || "Announcement"}
                </div>
                <div className="t-strong" style={{ textWrap: "pretty" }}>{a.title}</div>
                <div className="t-small" style={{ textWrap: "pretty" }}>{a.body}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming events */}
      <section>
        <div className="section-head">
          <h2>Upcoming events</h2>
        </div>
        {events === null ? (
          <div className="grid-events">
            <SkelEventCard /><SkelEventCard /><SkelEventCard />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon="calendar-empty"
            title="Nothing scheduled"
            body="When organizers publish events, you'll see them here."
            action={
              effectiveRole !== "STUDENT" ? (
                <Button variant="secondary" leadingIcon="plus" onClick={() => navigate("/create-event")}>
                  Create event
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid-events">
            {events.map((ev) => (
              <EventCard
                key={ev._id}
                event={ev}
                rsvped={hasRsvp(ev._id)}
                busy={!!busy[ev._id]}
                onToggleRsvp={toggleRsvp}
                onOpen={() => navigate(`/events/${ev._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

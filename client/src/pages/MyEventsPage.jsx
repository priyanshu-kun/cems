import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Segmented } from "../components/Form.jsx";
import { Card, EmptyState, SkelEventCard, Banner } from "../components/Primitives.jsx";
import { EventCard } from "../components/EventCard.jsx";
import { Button } from "../components/Button.jsx";
import * as EventsAPI from "../api/events.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useRsvps } from "../hooks/useLocalStore.js";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function MyEventsPage() {
  const { user, effectiveRole, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { ids: rsvpIds } = useRsvps();

  const [tab, setTab] = useState("upcoming");
  const [rsvpEvents, setRsvpEvents] = useState(null);
  const [organizedEvents, setOrganizedEvents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = `My events · ${config.appName}`; }, []);

  // Load RSVPed events (one fetch per id, in parallel)
  useEffect(() => {
    let alive = true;
    if (rsvpIds.length === 0) { setRsvpEvents([]); return; }
    setRsvpEvents(null);
    Promise.all(rsvpIds.map((id) => EventsAPI.getEvent(id).catch(() => null)))
      .then((arr) => { if (alive) setRsvpEvents(arr.filter(Boolean)); })
      .catch((e) => { if (alive) setError(errorMessage(e, "Couldn't load your events.")); });
    return () => { alive = false; };
  }, [rsvpIds.join(",")]); // eslint-disable-line

  // Load organizer's own events (only if Organizer/Admin)
  useEffect(() => {
    if (!isOrganizer && !isAdmin) return;
    let alive = true;
    setOrganizedEvents(null);
    EventsAPI.listEvents({ limit: 100 })
      .then((data) => {
        if (!alive) return;
        const mine = (data.items || []).filter((e) => e.organizerId === user?._id);
        setOrganizedEvents(mine);
      })
      .catch((e) => { if (alive) setError(errorMessage(e, "Couldn't load your events.")); });
    return () => { alive = false; };
  }, [isOrganizer, isAdmin, user?._id]);

  const now = Date.now();
  const upcoming = (rsvpEvents || []).filter((e) => new Date(e.endTime).getTime() >= now - 86400000);
  const past = (rsvpEvents || []).filter((e) => new Date(e.endTime).getTime() < now - 86400000);

  const tabs =
    isOrganizer || isAdmin
      ? [
          { value: "upcoming", label: "Upcoming" },
          { value: "past", label: "Past" },
          { value: "mine", label: "Mine" },
        ]
      : [
          { value: "upcoming", label: "Upcoming" },
          { value: "past", label: "Past" },
        ];

  const list =
    tab === "upcoming" ? upcoming
    : tab === "past" ? past
    : organizedEvents || [];

  const loading = (tab === "mine" ? organizedEvents : rsvpEvents) === null;

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>My events</h1>
          <div className="t-small">Everything you've RSVPed to{(isOrganizer || isAdmin) ? " — plus events you organize." : "."}</div>
        </div>
        <Segmented options={tabs} value={tab} onChange={setTab} />
      </header>

      {error ? <Banner kind="danger">{error}</Banner> : null}

      {loading ? (
        <div className="grid-events">
          <SkelEventCard /><SkelEventCard /><SkelEventCard />
        </div>
      ) : list.length === 0 ? (
        tab === "mine" ? (
          <EmptyState
            icon="calendar-empty"
            title="You haven't created any events yet."
            action={
              <Button variant="secondary" leadingIcon="plus" onClick={() => navigate("/create-event")}>
                Create event
              </Button>
            }
          />
        ) : tab === "past" ? (
          <EmptyState icon="inbox" title="No past events." />
        ) : (
          <EmptyState
            icon="calendar-empty"
            title="You haven't RSVPed to anything yet."
            action={<Button variant="secondary" onClick={() => navigate("/events")}>Browse events</Button>}
          />
        )
      ) : tab === "mine" ? (
        <Card className="card-flush">
          <div className="list">
            {list.map((ev) => (
              <EventCard key={ev._id} event={ev} variant="row" onOpen={() => navigate(`/events/${ev._id}`)} />
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid-events">
          {list.map((ev) => (
            <EventCard
              key={ev._id}
              event={ev}
              rsvped
              onOpen={() => navigate(`/events/${ev._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { Card, Pill, Progress } from "./Primitives.jsx";
import { Icon } from "./Icon.jsx";
import { Button } from "./Button.jsx";
import { fmtCardDateTime } from "../utils/format.js";

// Two presentations:
//  - default ("card"): big tile with title, venue, capacity meter, RSVP CTA
//  - "row":           list-row layout for tables

export function EventCard({ event, rsvped, onToggleRsvp, onOpen, variant = "card", busy }) {
  if (!event) return null;
  const isFull = (event.rsvpCount || 0) >= (event.capacity || 0) && !rsvped;
  const venue = event.venueName || event.venueId || "—";
  const organizer = event.organizerName || event.organizerId || "";

  if (variant === "row") {
    return (
      <button className="row-item" onClick={onOpen}>
        <div style={{ flex: 1, minWidth: 0 }} className="col gap-1">
          <div className="row gap-2"><Pill status={event.status} /></div>
          <div className="t-strong" style={{ textWrap: "pretty" }}>{event.title}</div>
          <div className="t-small">{fmtCardDateTime(event.startTime || event.start)} · {venue}</div>
        </div>
        <Icon name="chevron-right" color="var(--color-text-secondary)" />
      </button>
    );
  }

  return (
    <Card className="event-card" as="div">
      <div className="event-card-grid">
        <button
          onClick={onOpen}
          aria-label={`Open ${event.title}`}
          className="event-card-body"
        >
          {organizer ? (
            <div className="t-caption" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {organizer}
            </div>
          ) : null}
          <div className="t-h2" style={{ textWrap: "pretty" }}>{event.title}</div>
          <div className="event-card-meta">
            <span><Icon name="calendar" size={14} color="var(--color-text-secondary)" /> {fmtCardDateTime(event.startTime || event.start)}</span>
            <span><Icon name="map-pin" size={14} color="var(--color-text-secondary)" /> {venue}</span>
            <span><Icon name="users" size={14} color="var(--color-text-secondary)" /> {event.rsvpCount || 0} / {event.capacity || 0}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Progress value={event.rsvpCount || 0} max={event.capacity || 1} />
          </div>
        </button>
        <div className="event-card-side">
          <Pill status={event.status} />
          {onToggleRsvp ? (
            <Button
              size="sm"
              variant={rsvped ? "secondary" : "primary"}
              onClick={(e) => { e.stopPropagation(); onToggleRsvp(event); }}
              disabled={isFull || busy}
              loading={busy}
              leadingIcon={rsvped ? "check" : undefined}
            >
              {rsvped ? "Going" : isFull ? "Full" : "RSVP"}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

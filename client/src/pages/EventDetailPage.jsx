import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, IconButton } from "../components/Button.jsx";
import { Field, Input, Select, Textarea, Chips } from "../components/Form.jsx";
import { Card, Pill, Progress, Banner, Skeleton } from "../components/Primitives.jsx";
import { Icon } from "../components/Icon.jsx";
import * as EventsAPI from "../api/events.js";
import * as GatePassAPI from "../api/gatePass.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { usePasses, useRsvps } from "../hooks/useLocalStore.js";
import { errorMessage, fmtDateRange } from "../utils/format.js";
import config from "../config.js";

const ACTIVE = ["APPROVED", "PUBLISHED", "ONGOING"];

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, effectiveRole, isAdmin, isOrganizer } = useAuth();
  const toast = useToast();
  const { openModal } = useModal();
  const { has: hasRsvp, add: addRsvp, remove: removeRsvp } = useRsvps();
  const { put: putPass } = usePasses();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);

  const load = async () => {
    setEvent(null);
    setError(null);
    try {
      const ev = await EventsAPI.getEvent(id);
      setEvent(ev);
      document.title = `${ev.title} · ${config.appName}`;
    } catch (e) {
      setError(errorMessage(e, "Couldn't load this event."));
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const onRsvp = async () => {
    setRsvpBusy(true);
    try {
      await EventsAPI.rsvp(id);
      addRsvp(id);
      setEvent((e) => ({ ...e, rsvpCount: (e.rsvpCount || 0) + 1 }));
      toast.success("You're going.");
      // Try to fetch the gate pass right away.
      try {
        const { pass, qr } = await GatePassAPI.issuePass(id);
        putPass(id, { pass, qr, event: { title: event?.title, venueId: event?.venueId, startTime: event?.startTime } });
      } catch { /* not always issuable yet — ignore */ }
    } catch (e) {
      toast.error(errorMessage(e, "RSVP failed."));
    } finally {
      setRsvpBusy(false);
    }
  };

  const onCancelRsvp = () =>
    openModal({
      title: "Cancel your RSVP?",
      body: "You'll lose your spot and your gate pass for this event.",
      primaryLabel: "Cancel RSVP",
      onPrimary: async () => {
        try {
          await EventsAPI.cancelRsvp(id);
          removeRsvp(id);
          setEvent((e) => ({ ...e, rsvpCount: Math.max(0, (e.rsvpCount || 0) - 1) }));
          toast.info("RSVP cancelled.");
        } catch (e) {
          toast.error(errorMessage(e, "Couldn't cancel RSVP."));
        }
      },
    });

  const setStatus = async (next) => {
    setAdminBusy(true);
    try {
      const updated = await EventsAPI.setEventStatus(id, next);
      setEvent(updated);
      toast.success(`Status updated to ${next}.`);
    } catch (e) {
      toast.error(errorMessage(e, "Status change failed."));
    } finally {
      setAdminBusy(false);
    }
  };

  if (error) {
    return (
      <div className="col gap-4">
        <BackHeader onBack={() => navigate(-1)} title="Event" />
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="col gap-4">
        <BackHeader onBack={() => navigate(-1)} title="Event" />
        <Skeleton w="60%" h={28} />
        <Skeleton w="40%" h={16} />
        <Skeleton w="100%" h={120} />
      </div>
    );
  }

  const rsvped = hasRsvp(event._id);
  const isFull = (event.rsvpCount || 0) >= (event.capacity || 0) && !rsvped;
  const inactive = !ACTIVE.includes(event.status);
  const isOwner = event.organizerId && user?._id === event.organizerId;

  return (
    <div className="col gap-6">
      <BackHeader onBack={() => navigate(-1)} title="Event details" />

      <div className="col gap-4">
        <div className="row gap-2"><Pill status={event.status} /></div>
        <h1 className="t-display" style={{ margin: 0, textWrap: "pretty" }}>{event.title}</h1>
        <div className="col gap-2">
          <div className="row gap-2 t-small"><Icon name="calendar" size={16} color="var(--color-text-secondary)" /><span>{fmtDateRange(event.startTime, event.endTime)}</span></div>
          <div className="row gap-2 t-small"><Icon name="map-pin" size={16} color="var(--color-text-secondary)" /><span>{event.venueName || event.venueId}</span></div>
          <div className="row gap-2 t-small"><Icon name="users" size={16} color="var(--color-text-secondary)" /><span>{event.rsvpCount || 0} of {event.capacity} going</span></div>
        </div>
        <Progress value={event.rsvpCount || 0} max={event.capacity || 1} />
      </div>

      <Card>
        <div className="t-strong">About this event</div>
        <p className="t-body" style={{ marginTop: 8, textWrap: "pretty", whiteSpace: "pre-line" }}>{event.description}</p>
        {event.tags && event.tags.length ? (
          <div className="chips" style={{ marginTop: 12 }}>
            {event.tags.map((t) => <span key={t} className="chip chip-static chip-tag">#{t}</span>)}
          </div>
        ) : null}
      </Card>

      {!inactive ? (
        rsvped ? (
          <div className="col gap-2">
            <Button variant="secondary" leadingIcon="check" onClick={onCancelRsvp}>You're going · Cancel RSVP</Button>
            <Banner kind="info" icon="ticket">Your gate pass is ready in the My Pass tab.</Banner>
          </div>
        ) : isFull ? (
          <Button variant="primary" disabled>Event is full</Button>
        ) : (
          <Button variant="primary" size="lg" loading={rsvpBusy} onClick={onRsvp}>RSVP to this event</Button>
        )
      ) : null}

      {event.status === "CANCELLED" ? <Banner kind="danger">This event was cancelled.</Banner> : null}
      {event.status === "COMPLETED" ? <Banner kind="info">This event has ended.</Banner> : null}

      {/* Admin actions */}
      {isAdmin ? (
        <Card>
          <div className="t-strong">Admin actions</div>
          <div className="col gap-2 mt-3">
            {event.status === "PENDING_APPROVAL" ? (
              <Button variant="primary" loading={adminBusy} onClick={() => setStatus("APPROVED")}>Approve event</Button>
            ) : null}
            {event.status === "APPROVED" ? (
              <Button variant="primary" loading={adminBusy} onClick={() => setStatus("PUBLISHED")}>Publish event</Button>
            ) : null}
            {event.status === "PUBLISHED" ? (
              <Button variant="secondary" loading={adminBusy} onClick={() => setStatus("ONGOING")}>Mark as ongoing</Button>
            ) : null}
            {event.status === "ONGOING" ? (
              <Button variant="secondary" loading={adminBusy} onClick={() => setStatus("COMPLETED")}>Mark as completed</Button>
            ) : null}
            {!["CANCELLED", "COMPLETED"].includes(event.status) ? (
              <Button variant="danger" loading={adminBusy} onClick={() => setStatus("CANCELLED")}>Cancel event</Button>
            ) : null}
            <Button variant="ghost" leadingIcon="users" onClick={() => navigate(`/events/${id}/guests`)}>Manage guests</Button>
          </div>
        </Card>
      ) : null}

      {/* Organizer actions for their own event */}
      {!isAdmin && isOrganizer && isOwner ? (
        <Card>
          <div className="t-strong">Manage</div>
          <div className="col gap-2 mt-3">
            {event.status === "DRAFT" ? (
              <Button variant="primary" loading={adminBusy} onClick={() => setStatus("PENDING_APPROVAL")}>Submit for approval</Button>
            ) : null}
            {!["CANCELLED", "COMPLETED"].includes(event.status) ? (
              <Button variant="danger" loading={adminBusy} onClick={() => setStatus("CANCELLED")}>Cancel event</Button>
            ) : null}
            <Button variant="ghost" leadingIcon="users" onClick={() => navigate(`/events/${id}/guests`)}>Manage guests</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function BackHeader({ onBack, title }) {
  return (
    <div className="row gap-2">
      <IconButton icon="back" label="Back" onClick={onBack} />
      <div className="t-strong">{title}</div>
    </div>
  );
}

// Preview-only: mock data shaped like the backend's OpenAPI responses.
// The real app's API client (src/api/*) hits a live server. This file
// just powers the visual preview in preview.html.

(function () {
  const today = new Date();
  const d = (days, hour = 18, min = 0) => {
    const t = new Date(today);
    t.setDate(t.getDate() + days);
    t.setHours(hour, min, 0, 0);
    return t.toISOString();
  };

  const venues = {
    v1: "Main Auditorium",
    v2: "Seminar Hall A",
    v3: "Convention Centre",
    v4: "Open Air Theatre",
    v5: "Computer Lab 3",
    v6: "Sports Complex",
  };

  const events = [
    {
      _id: "e1", title: "TechFest 2026 — Opening Ceremony",
      description: "Kick-off for our annual three-day technical festival. Keynote by alumni at Google DeepMind, followed by sponsor showcase and the official TechFest theme reveal.",
      organizerId: "u_org", organizerName: "TechFest Committee",
      venueId: "v1", venueName: venues.v1,
      startTime: d(2, 18, 0), endTime: d(2, 21, 0),
      status: "PUBLISHED", capacity: 500, rsvpCount: 384,
      tags: ["techfest", "keynote"],
    },
    {
      _id: "e2", title: "Spandan — Annual Cultural Night",
      description: "An evening of music, dance and drama by student clubs. Featuring the Western Music Society headline set and the inter-department fashion walk.",
      organizerId: "u_org", organizerName: "Cultural Committee",
      venueId: "v4", venueName: venues.v4,
      startTime: d(5, 19, 0), endTime: d(5, 23, 0),
      status: "PUBLISHED", capacity: 800, rsvpCount: 612,
      tags: ["cultural", "music"],
    },
    {
      _id: "e3", title: "Code Storm — 24-hour Hackathon",
      description: "Build something that solves a real campus problem. Teams of up to four. Mentors from Razorpay and Zerodha. Meals provided through the night. Final demos at noon Sunday.",
      organizerId: "u_org", organizerName: "Coding Club",
      venueId: "v5", venueName: venues.v5,
      startTime: d(9, 9, 0), endTime: d(10, 12, 0),
      status: "PUBLISHED", capacity: 60, rsvpCount: 42,
      tags: ["hackathon", "coding"],
    },
    {
      _id: "e4", title: "Industry Talk: Building India's Payment Stack",
      description: "Senior PM at NPCI on the evolution of UPI, what's next for cross-border rails, and how engineering students can contribute. Q&A after.",
      organizerId: "u_org", organizerName: "Entrepreneurship Cell",
      venueId: "v2", venueName: venues.v2,
      startTime: d(12, 16, 0), endTime: d(12, 17, 30),
      status: "PUBLISHED", capacity: 80, rsvpCount: 80,
      tags: ["talk", "fintech"],
    },
    {
      _id: "e5", title: "Alumni Meet — Class of 2015",
      description: "Reconnect with the batch of 2015 over high tea and a campus walk.",
      organizerId: "u_org", organizerName: "Alumni Cell",
      venueId: "v3", venueName: venues.v3,
      startTime: d(18, 17, 0), endTime: d(18, 20, 0),
      status: "APPROVED", capacity: 300, rsvpCount: 47,
      tags: ["alumni"],
    },
  ];

  const announcements = [
    { _id: "a1", title: "TechFest registrations close Friday", body: "Final day to register your team. No on-spot entries this year.", eventId: "e1", authorName: "TechFest Committee", publishedAt: d(-1) },
    { _id: "a2", title: "Spandan auditions — slot 2 added",     body: "Solo singing auditions get an extra slot Thursday 5 PM at the music room.", eventId: "e2", authorName: "Cultural Committee", publishedAt: d(-2) },
    { _id: "a3", title: "Library hours extended this week",     body: "Open till midnight through the end of mid-sem week.", eventId: null, authorName: "Library", publishedAt: d(-2) },
    { _id: "a4", title: "Hackathon mentors confirmed",          body: "Mentors from Razorpay and Zerodha will be on site through both nights.", eventId: "e3", authorName: "Coding Club", publishedAt: d(-3) },
  ];

  const users = {
    STUDENT: { _id: "u_s", fullName: "Aarav Sharma", email: "aarav.s22@glauniversity.in", roles: ["STUDENT"], department: "CSE", year: 3, isEmailVerified: true },
    ORGANIZER: { _id: "u_o", fullName: "Diya Patel", email: "diya.p21@glauniversity.in", roles: ["STUDENT", "ORGANIZER"], department: "ECE", year: 4, isEmailVerified: true },
    ADMIN: { _id: "u_a", fullName: "Dr. Ramesh Iyer", email: "r.iyer@glauniversity.in", roles: ["ADMIN"], department: "Event Office", year: null, isEmailVerified: true },
  };

  const passes = {
    e1: {
      pass: { passId: "P-T6F2-9KQX", eventId: "e1", userId: "u_s", expiresAt: d(2, 21, 30), status: "ISSUED" },
      qr: { v: 1, passId: "P-T6F2-9KQX", sig: "demo" },
    },
    e3: {
      pass: { passId: "P-H4M8-2VRT", eventId: "e3", userId: "u_s", expiresAt: d(9, 18, 0), status: "ISSUED" },
      qr: { v: 1, passId: "P-H4M8-2VRT", sig: "demo" },
    },
  };

  // Formatters mirroring src/utils/format.js
  const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtTime(iso) {
    const d = new Date(iso); let h = d.getHours(); const m = d.getMinutes();
    const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ap}`;
  }
  function fmtCardDateTime(iso) {
    const d = new Date(iso);
    return `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTH[d.getMonth()]} · ${fmtTime(iso)}`;
  }
  function fmtDateRange(s, e) {
    const a = new Date(s), b = new Date(e);
    const head = `${WEEK[a.getDay()]}, ${a.getDate()} ${MONTH[a.getMonth()]}`;
    if (a.toDateString() === b.toDateString()) return `${head} · ${fmtTime(s)} – ${fmtTime(e)}`;
    return `${head} ${fmtTime(s)} → ${WEEK[b.getDay()]}, ${b.getDate()} ${MONTH[b.getMonth()]} ${fmtTime(e)}`;
  }
  function statusLabel(s) {
    return ({
      DRAFT: "Draft", PENDING_APPROVAL: "Pending approval", APPROVED: "Approved",
      PUBLISHED: "Published", ONGOING: "Live now", COMPLETED: "Completed", CANCELLED: "Cancelled",
    })[s] || s;
  }
  function initials(name = "") {
    return name.split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  }

  window.MOCK = {
    venues, events, announcements, users, passes,
    fmtTime, fmtCardDateTime, fmtDateRange, statusLabel, initials,
    appName: "CEMS", collegeName: "GLA University", brandInitial: "C",
  };
})();

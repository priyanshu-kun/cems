// Mock data for CEMS (College Event Management System)
// Indian college context — departments, events, names

window.CEMS_DATA = (function () {
  const today = new Date(); // demo date base
  const d = (daysFromToday, hour = 18, min = 0) => {
    const t = new Date(today);
    t.setDate(t.getDate() + daysFromToday);
    t.setHours(hour, min, 0, 0);
    return t.toISOString();
  };

  const COLLEGE_NAME = "GLA University";
  const DEPARTMENTS = ["CSE", "ECE", "ME", "CE", "EEE", "IT", "AIML", "MBA"];
  const YEARS = ["1", "2", "3", "4", "5"];

  const venues = [
    { id: "v1", name: "Main Auditorium",     capacity: 500 },
    { id: "v2", name: "Seminar Hall A",      capacity: 80 },
    { id: "v3", name: "Convention Centre",   capacity: 1200 },
    { id: "v4", name: "Open Air Theatre",    capacity: 800 },
    { id: "v5", name: "Computer Lab 3",      capacity: 60 },
    { id: "v6", name: "Sports Complex",      capacity: 300 },
  ];

  // Demo users
  const users = {
    student: {
      id: "u_student",
      name: "Aarav Sharma",
      email: "aarav.s22@glauniversity.in",
      department: "CSE",
      year: "3",
      roles: ["STUDENT"],
    },
    organizer: {
      id: "u_org",
      name: "Diya Patel",
      email: "diya.p21@glauniversity.in",
      department: "ECE",
      year: "4",
      roles: ["STUDENT", "ORGANIZER"],
    },
    admin: {
      id: "u_admin",
      name: "Dr. Ramesh Iyer",
      email: "r.iyer@glauniversity.in",
      department: "Event Office",
      year: "—",
      roles: ["ADMIN"],
    },
  };

  // Events — mix of statuses
  const events = [
    {
      id: "e1",
      title: "TechFest 2026 — Opening Ceremony",
      description: "Kick-off for our annual three-day technical festival. Keynote by alumni at Google DeepMind, followed by sponsor showcase and the official TechFest theme reveal.",
      venueId: "v1",
      venueName: "Main Auditorium",
      start: d(2, 18, 0),
      end:   d(2, 21, 0),
      capacity: 500,
      rsvpCount: 384,
      status: "PUBLISHED",
      tags: ["techfest", "keynote"],
      organizerId: "u_org",
      organizerName: "TechFest Committee",
      audience: { departments: [], years: [], roles: [] }, // everyone
    },
    {
      id: "e2",
      title: "Spandan — Annual Cultural Night",
      description: "An evening of music, dance and drama by student clubs. Featuring the Western Music Society headline set and the inter-department fashion walk.",
      venueId: "v4",
      venueName: "Open Air Theatre",
      start: d(5, 19, 0),
      end:   d(5, 23, 0),
      capacity: 800,
      rsvpCount: 612,
      status: "PUBLISHED",
      tags: ["cultural", "music"],
      organizerId: "u_org",
      organizerName: "Cultural Committee",
      audience: { departments: [], years: [], roles: [] },
    },
    {
      id: "e3",
      title: "Code Storm — 24-hour Hackathon",
      description: "Build something that solves a real campus problem. Teams of up to four. Mentors from Razorpay and Zerodha. Meals provided through the night. Final demos at noon Sunday.",
      venueId: "v5",
      venueName: "Computer Lab 3",
      start: d(9, 9, 0),
      end:   d(10, 12, 0),
      capacity: 60,
      rsvpCount: 42,
      status: "PUBLISHED",
      tags: ["hackathon", "coding"],
      organizerId: "u_org",
      organizerName: "Coding Club",
      audience: { departments: ["CSE", "IT", "AIML", "ECE"], years: [], roles: [] },
    },
    {
      id: "e4",
      title: "Industry Talk: Building India's Payment Stack",
      description: "Senior PM at NPCI on the evolution of UPI, what's next for cross-border rails, and how engineering students can contribute. Q&A after.",
      venueId: "v2",
      venueName: "Seminar Hall A",
      start: d(12, 16, 0),
      end:   d(12, 17, 30),
      capacity: 80,
      rsvpCount: 80,
      status: "PUBLISHED",
      tags: ["talk", "fintech"],
      organizerId: "u_org",
      organizerName: "Entrepreneurship Cell",
      audience: { departments: [], years: ["3","4"], roles: [] },
    },
    {
      id: "e5",
      title: "Alumni Meet — Class of 2015",
      description: "Reconnect with the batch of 2015 over high tea and a campus walk. Closed registration for invited alumni and current 4th-year students.",
      venueId: "v3",
      venueName: "Convention Centre",
      start: d(18, 17, 0),
      end:   d(18, 20, 0),
      capacity: 300,
      rsvpCount: 47,
      status: "APPROVED",
      tags: ["alumni"],
      organizerId: "u_org",
      organizerName: "Alumni Cell",
      audience: { departments: [], years: ["4"], roles: [] },
    },
    {
      id: "e6",
      title: "Inter-Department Football Cup — Final",
      description: "CSE vs ECE in the season finale. Match at 4 PM, prize ceremony at 6 PM. Bring your dept colours.",
      venueId: "v6",
      venueName: "Sports Complex",
      start: d(-3, 16, 0),
      end:   d(-3, 18, 30),
      capacity: 300,
      rsvpCount: 248,
      status: "COMPLETED",
      tags: ["sports"],
      organizerId: "u_org",
      organizerName: "Sports Council",
      audience: { departments: [], years: [], roles: [] },
    },
    // Pending approvals (admin queue)
    {
      id: "e7",
      title: "Robotics Workshop — Line Following Bots",
      description: "Hands-on build session with kits provided. Limited to 30 first-years.",
      venueId: "v5",
      venueName: "Computer Lab 3",
      start: d(7, 14, 0),
      end:   d(7, 17, 0),
      capacity: 30,
      rsvpCount: 0,
      status: "PENDING_APPROVAL",
      tags: ["workshop"],
      organizerId: "u_org",
      organizerName: "Robotics Club",
      audience: { departments: ["ECE", "EEE", "ME"], years: ["1","2"], roles: [] },
    },
    {
      id: "e8",
      title: "Photography Walk — Old Town",
      description: "Guided photo walk through the old town quarter. Meet at main gate at 6 AM sharp. Bring a charged camera or phone.",
      venueId: "v3",
      venueName: "Convention Centre",
      start: d(11, 6, 0),
      end:   d(11, 10, 0),
      capacity: 25,
      rsvpCount: 0,
      status: "PENDING_APPROVAL",
      tags: ["photography"],
      organizerId: "u_org",
      organizerName: "Lens Society",
      audience: { departments: [], years: [], roles: [] },
    },
    {
      id: "e9",
      title: "Mock Placement Drive — Aptitude Round",
      description: "Simulated company aptitude test followed by feedback from the placement cell. Final-year students only.",
      venueId: "v2",
      venueName: "Seminar Hall A",
      start: d(6, 10, 0),
      end:   d(6, 13, 0),
      capacity: 80,
      rsvpCount: 0,
      status: "PENDING_APPROVAL",
      tags: ["placement"],
      organizerId: "u_org",
      organizerName: "Placement Cell",
      audience: { departments: [], years: ["4"], roles: [] },
    },
    // Organizer's drafts
    {
      id: "e10",
      title: "Open Mic Night",
      description: "",
      venueId: "v4",
      venueName: "Open Air Theatre",
      start: d(15, 19, 0),
      end:   d(15, 22, 0),
      capacity: 200,
      rsvpCount: 0,
      status: "DRAFT",
      tags: [],
      organizerId: "u_org",
      organizerName: "Cultural Committee",
      audience: { departments: [], years: [], roles: [] },
    },
    // Cancelled
    {
      id: "e11",
      title: "Yoga Day Session",
      description: "Cancelled due to weather. Will be rescheduled.",
      venueId: "v6",
      venueName: "Sports Complex",
      start: d(-1, 7, 0),
      end:   d(-1, 8, 30),
      capacity: 150,
      rsvpCount: 64,
      status: "CANCELLED",
      tags: ["wellness"],
      organizerId: "u_org",
      organizerName: "Wellness Cell",
      audience: { departments: [], years: [], roles: [] },
    },
  ];

  const announcements = [
    { id: "a1", title: "TechFest registrations close Friday",  body: "Final day to register your team. No on-spot entries this year.", eventId: "e1", postedBy: "TechFest Committee", postedAt: d(-1) },
    { id: "a2", title: "Spandan auditions — slot 2 added",      body: "Solo singing auditions get an extra slot Thursday 5 PM at the music room.", eventId: "e2", postedBy: "Cultural Committee", postedAt: d(-2) },
    { id: "a3", title: "Library hours extended this week",      body: "Open till midnight through the end of mid-sem week.", eventId: null, postedBy: "Library", postedAt: d(-2) },
    { id: "a4", title: "Hackathon mentors confirmed",           body: "Mentors from Razorpay and Zerodha will be on site through both nights.", eventId: "e3", postedBy: "Coding Club", postedAt: d(-3) },
    { id: "a5", title: "Campus Wi-Fi maintenance — Sun 2 AM",   body: "30 minute outage expected. Affects all blocks except the hostel.", eventId: null, postedBy: "IT Office", postedAt: d(-4) },
  ];

  // RSVPs (which events the student has RSVPed to)
  const initialRsvps = ["e1", "e3"];

  // Gate passes for the student's RSVPed events
  const passes = {
    e1: { passId: "P-T6F2-9KQX", validUntil: d(2, 21, 30), expired: false, qrPayload: "QR:e1:u_student:abc123" },
    e3: { passId: "P-H4M8-2VRT", validUntil: d(9, 18, 0),  expired: false, qrPayload: "QR:e3:u_student:def456" },
  };

  // Assets (admin)
  const assets = [
    { id: "as1", name: "Wireless Mics",      category: "Audio",  total: 20, available: 12 },
    { id: "as2", name: "Folding Chairs",     category: "Seating", total: 200, available: 144 },
    { id: "as3", name: "Projectors",         category: "AV",     total: 6,  available: 2 },
    { id: "as4", name: "Extension Boards",   category: "Power",  total: 30, available: 22 },
    { id: "as5", name: "Stage Lights (RGB)", category: "Lighting", total: 12, available: 0 },
  ];

  return {
    COLLEGE_NAME, DEPARTMENTS, YEARS,
    venues, users, events, announcements,
    initialRsvps, passes, assets,
  };
})();

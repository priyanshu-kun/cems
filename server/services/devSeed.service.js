'use strict';

/**
 * Idempotent demo seeder.
 *
 * Builds a complete, realistic dataset that exercises every endpoint:
 *   - one student / organizer / admin (known credentials)
 *   - three venues
 *   - five events across DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, COMPLETED
 *   - confirmed RSVP for the student on the APPROVED event
 *   - one issued gate pass for that RSVP
 *   - three assets (projector / microphone / chair)
 *   - one targeted + one broadcast announcement
 *
 * Re-running this is safe — it deletes the demo cohort by stable markers
 * (the demo emails, `seedTag` on entities) and rebuilds from scratch.
 */

const env = require('../config/env');
const User = require('../models/user.model');
const Venue = require('../models/venue.model');
const Event = require('../models/event.model');
const Rsvp = require('../models/rsvp.model');
const GatePass = require('../models/gatePass.model');
const Asset = require('../models/asset.model');
const Announcement = require('../models/announcement.model');
const { sign, toQrPayload } = require('../utils/gatePassSigner');
const { issueTokenPair } = require('../utils/jwt');

const DEMO_PASSWORD = 'password123';
const DEMO_TAG = 'cems-demo';

const DEMO_USERS = Object.freeze([
  {
    fullName: 'Kashish',
    email: 'kashish@glauniversity.in',
    roles: ['STUDENT'],
    department: 'CSE',
    year: 3,
  },
  {
    fullName: 'Sara Student',
    email: 'student@glauniversity.in',
    roles: ['STUDENT'],
    department: 'CSE',
    year: 3,
  },
  {
    fullName: 'Oscar Organizer',
    email: 'organizer@glauniversity.in',
    roles: ['ORGANIZER'],
    department: 'CSE',
    year: 4,
  },
  {
    fullName: 'Alma Admin',
    email: 'admin@glauniversity.in',
    roles: ['ADMIN'],
    department: 'ADMIN',
    year: 6,
  },
]);

const DEMO_VENUES = Object.freeze([
  { name: 'Main Auditorium', building: 'A Block', capacity: 500 },
  { name: 'Innovation Hall', building: 'B Block', capacity: 200 },
  { name: 'Lecture Theatre 4', building: 'C Block', capacity: 120 },
]);

const DEMO_ASSETS = Object.freeze([
  { name: 'Projector — Epson EB', category: 'PROJECTOR', totalQuantity: 6 },
  { name: 'Microphone — Shure SM58', category: 'MICROPHONE', totalQuantity: 10 },
  { name: 'Stackable Chair', category: 'CHAIR', totalQuantity: 400 },
]);

function isProdLike() {
  return env.NODE_ENV === 'production';
}

async function clearDemoData() {
  if (isProdLike()) {
    throw new Error('refusing to clear demo data in production');
  }
  const venues = await Venue.find({ name: { $in: DEMO_VENUES.map((v) => v.name) } }, { _id: 1 }).lean();
  const venueIds = venues.map((v) => v._id);

  // Match current cohort by explicit email + legacy cohort by domain (one-time
  // cleanup so prior `@cems.local` seeds don't linger after the GLA switch).
  const userEmails = DEMO_USERS.map((u) => u.email);
  const users = await User.find(
    { $or: [{ email: { $in: userEmails } }, { email: { $regex: /@cems\.local$/ } }] },
    { _id: 1, email: 1 }
  ).lean();
  const userIds = users.map((u) => u._id);

  await Promise.all([
    Event.deleteMany({ $or: [{ venueId: { $in: venueIds } }, { tags: DEMO_TAG }] }),
    Rsvp.deleteMany({ userId: { $in: userIds } }),
    GatePass.deleteMany({ userId: { $in: userIds } }),
    Announcement.deleteMany({ authorId: { $in: userIds } }),
    Asset.deleteMany({ name: { $in: DEMO_ASSETS.map((a) => a.name) } }),
  ]);
  await Promise.all([
    User.deleteMany({ _id: { $in: userIds } }),
    Venue.deleteMany({ _id: { $in: venueIds } }),
  ]);

  return { cleared: true, removedUsers: users.length };
}

async function seedAll() {
  if (isProdLike()) {
    throw new Error('refusing to seed in production');
  }

  await clearDemoData();

  // --- Users -------------------------------------------------------------
  const passwordHash = await User.hashPassword(DEMO_PASSWORD);
  const users = await User.insertMany(
    DEMO_USERS.map((u) => ({ ...u, passwordHash, isEmailVerified: true }))
  );
  const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));

  const kashish = byEmail['kashish@glauniversity.in'];
  const student = byEmail['student@glauniversity.in'];
  const organizer = byEmail['organizer@glauniversity.in'];
  const admin = byEmail['admin@glauniversity.in'];

  // --- Venues ------------------------------------------------------------
  const venues = await Venue.insertMany(DEMO_VENUES);
  const auditorium = venues[0];
  const hall = venues[1];
  const theatre = venues[2];

  // --- Events across lifecycle ------------------------------------------
  const now = Date.now();
  const HOUR = 3600 * 1000;
  const DAY = 24 * HOUR;

  const events = await Event.insertMany([
    {
      title: 'Drafting Next Year Calendar',
      description: 'Internal organizer-only working session.',
      organizerId: organizer._id,
      venueId: theatre._id,
      startTime: new Date(now + 10 * DAY),
      endTime: new Date(now + 10 * DAY + 2 * HOUR),
      status: 'DRAFT',
      capacity: 30,
      tags: [DEMO_TAG, 'internal'],
    },
    {
      title: 'Robotics Open House',
      description: 'Hands-on demos by the robotics club. Refreshments served.',
      organizerId: organizer._id,
      venueId: hall._id,
      startTime: new Date(now + 5 * DAY),
      endTime: new Date(now + 5 * DAY + 3 * HOUR),
      status: 'PENDING_APPROVAL',
      capacity: 150,
      tags: [DEMO_TAG, 'robotics'],
      targetAudience: { departments: ['CSE', 'ECE', 'MECH'], years: [2, 3, 4] },
    },
    {
      title: 'Annual Tech Fest 2026',
      description: 'Three days of coding contests, hackathons, and tech talks.',
      organizerId: organizer._id,
      venueId: auditorium._id,
      startTime: new Date(now + 2 * DAY),
      endTime: new Date(now + 2 * DAY + 4 * HOUR),
      status: 'APPROVED',
      capacity: 400,
      tags: [DEMO_TAG, 'tech-fest'],
      targetAudience: { departments: ['CSE'], years: [3] },
    },
    {
      title: 'Career Fair · Spring Edition',
      description: 'Top recruiters from across the country. Bring your resume.',
      organizerId: organizer._id,
      venueId: auditorium._id,
      startTime: new Date(now + 12 * DAY),
      endTime: new Date(now + 12 * DAY + 6 * HOUR),
      status: 'PUBLISHED',
      capacity: 500,
      tags: [DEMO_TAG, 'career'],
    },
    {
      title: 'Welcome Orientation 2025',
      description: 'Last semester orientation for first-year students.',
      organizerId: organizer._id,
      venueId: hall._id,
      startTime: new Date(now - 90 * DAY),
      endTime: new Date(now - 90 * DAY + 2 * HOUR),
      status: 'COMPLETED',
      capacity: 200,
      tags: [DEMO_TAG, 'orientation'],
    },
  ]);

  const approvedEvent = events.find((e) => e.status === 'APPROVED');
  const publishedEvent = events.find((e) => e.status === 'PUBLISHED');

  // --- RSVPs: student → APPROVED event, kashish → PUBLISHED event ------
  await Rsvp.insertMany([
    { userId: student._id, eventId: approvedEvent._id, status: 'CONFIRMED', confirmedAt: new Date() },
    { userId: kashish._id, eventId: publishedEvent._id, status: 'CONFIRMED', confirmedAt: new Date() },
  ]);
  await Event.updateOne({ _id: approvedEvent._id }, { $inc: { rsvpCount: 1 } });
  await Event.updateOne({ _id: publishedEvent._id }, { $inc: { rsvpCount: 1 } });

  // --- Gate passes for both RSVPs --------------------------------------
  function buildPass(userId, event) {
    const issuedAt = new Date();
    const expiresAt = new Date(event.endTime);
    const ttlCap = new Date(event.startTime.getTime() + env.GATE_PASS_TTL_HOURS * HOUR);
    if (ttlCap < expiresAt) expiresAt.setTime(ttlCap.getTime());

    const doc = new GatePass({
      eventId: event._id,
      userId,
      issuedAt,
      expiresAt,
      signature: 'pending',
    });
    doc.signature = sign({
      passId: doc.passId,
      eventId: doc.eventId,
      userId: doc.userId,
      issuedAt: doc.issuedAt,
      expiresAt: doc.expiresAt,
    });
    return doc;
  }

  const studentPass = buildPass(student._id, approvedEvent);
  const kashishPass = buildPass(kashish._id, publishedEvent);
  await Promise.all([studentPass.save(), kashishPass.save()]);
  const pass = studentPass;

  // --- Assets ----------------------------------------------------------
  const assets = await Asset.insertMany(
    DEMO_ASSETS.map((a) => ({ ...a, availableQuantity: a.totalQuantity }))
  );

  // --- Announcements (one broadcast + one targeted) -------------------
  const announcements = await Announcement.insertMany([
    {
      title: 'Welcome back to campus!',
      body: 'A new semester begins. Check out upcoming events to get involved.',
      authorId: admin._id,
      isPinned: true,
      publishedAt: new Date(now - HOUR),
    },
    {
      title: 'Tech Fest registrations open',
      body: 'CSE Year-3 students — registrations are open for the Annual Tech Fest.',
      authorId: organizer._id,
      eventId: approvedEvent._id,
      targetAudience: { departments: ['CSE'], years: [3] },
      publishedAt: new Date(now - 2 * HOUR),
    },
  ]);

  // --- Pre-built tokens for convenience --------------------------------
  const tokens = {
    kashish: issueTokenPair(kashish),
    student: issueTokenPair(student),
    organizer: issueTokenPair(organizer),
    admin: issueTokenPair(admin),
  };

  return {
    credentials: DEMO_USERS.map(({ email, roles, department, year }) => ({
      email,
      password: DEMO_PASSWORD,
      roles,
      department,
      year,
    })),
    tokens,
    summary: {
      users: users.length,
      venues: venues.length,
      events: events.length,
      rsvps: 2,
      gatePasses: 2,
      assets: assets.length,
      announcements: announcements.length,
    },
    samples: {
      approvedEventId: String(approvedEvent._id),
      publishedEventId: String(publishedEvent._id),
      gatePassId: pass.passId,
      gatePassQr: toQrPayload(pass),
      kashishGatePassId: kashishPass.passId,
      kashishGatePassQr: toQrPayload(kashishPass),
    },
  };
}

function credentialsOnly() {
  return DEMO_USERS.map(({ email, roles, department, year }) => ({
    email,
    password: DEMO_PASSWORD,
    roles,
    department,
    year,
  }));
}

module.exports = { seedAll, clearDemoData, credentialsOnly, DEMO_PASSWORD };

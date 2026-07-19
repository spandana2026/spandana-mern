/**
 * seed.js — populates MongoDB with the sample data already shipped in
 * backend/data/*.json (the same data the app uses out of the box in
 * zero-config JSON-file mode).
 *
 * Requires MONGO_URI to be set in backend/.env. If it isn't set (or the
 * cluster isn't reachable) this script stops and tells you — the app itself
 * would otherwise just silently fall back to JSON-file storage.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'node:dns';

// Same fix as server.js: Node's built-in resolver doesn't reliably pick up
// Windows DNS changes for mongodb+srv:// SRV lookups, causing
// "querySrv ECONNREFUSED" even when the system DNS is set correctly.
// Forcing Google's DNS here avoids that.
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { env } from './config/env.js';
import { connectDB, isDbConnected } from './config/db.js';

import { BlogPost }            from './models/BlogPost.js';
import { CommunityInitiative } from './models/CommunityInitiative.js';
import { Event }               from './models/Event.js';
import { Gallery }             from './models/Gallery.js';
import { GameListing }         from './models/GameListing.js';
import { Newsletter }          from './models/Newsletter.js';
import { Program }             from './models/Program.js';
import { Story }               from './models/Story.js';
import { Testimonial }         from './models/Testimonial.js';
import { Value }               from './models/Value.js';
import { Volunteer }           from './models/Volunteer.js';
import { Settings }            from './models/Settings.js';
import './models/Team.js'; // registers the 'Team' mongoose model as a side effect

function readJson(file) {
  const fp = path.join(env.DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return [];
  }
}

// Every entry here maps one backend/data/*.json file onto the model that
// already knows how to write it to Mongo (model.replaceAll does a
// deleteMany + insertMany under the hood — see models/base.js pattern).
const collections = [
  { name: 'Blog posts',             file: 'blog-posts.json',             model: BlogPost },
  { name: 'Community initiatives',  file: 'community-initiatives.json',  model: CommunityInitiative },
  { name: 'Events',                 file: 'events.json',                 model: Event },
  { name: 'Gallery items',          file: 'gallery.json',                model: Gallery },
  { name: 'Game listings',          file: 'game-listings.json',          model: GameListing },
  { name: 'Newsletter subscribers', file: 'newsletter-subscribers.json', model: Newsletter },
  { name: 'Health programs',        file: 'health-programs.json',        model: Program },
  { name: 'Stories',                file: 'stories.json',                model: Story },
  { name: 'Testimonials',           file: 'testimonials.json',           model: Testimonial },
  { name: 'Values',                 file: 'values.json',                 model: Value },
  { name: 'Volunteers',             file: 'volunteers.json',             model: Volunteer },
];

async function seed() {
  await connectDB();

  if (!isDbConnected()) {
    console.error('\n[seed] MongoDB is not connected.');
    console.error('[seed] Set MONGO_URI in backend/.env to a reachable cluster, then re-run: npm run seed\n');
    process.exit(1);
  }

  console.log(`[seed] Connected to MongoDB. Seeding from ${env.DATA_DIR} ...\n`);

  for (const { name, file, model } of collections) {
    const data = readJson(file);
    await model.replaceAll(data);
    console.log(`  \u2713 ${name.padEnd(24)} ${data.length} record(s)`);
  }

  // Settings is a single live doc + a single draft doc, not a list, so it's
  // seeded separately using its own live/draft API instead of replaceAll.
  const live  = readJson('settings.json');
  const draft = readJson('settings_draft.json');
  await Settings.saveDraft(live);
  await Settings.publish();               // live = live-file content
  if (draft && Object.keys(draft).length) {
    await Settings.saveDraft(draft);       // draft = draft-file content (unpublished)
  }
  console.log(`  \u2713 ${'Settings'.padEnd(24)} live + draft`);

  // Team accounts already store a bcrypt passwordHash (not a plain password)
  // in team.json, so they're inserted directly rather than via Team.create().
  const TeamModel = mongoose.model('Team');
  const team = readJson('team.json');
  await TeamModel.deleteMany({});
  if (team.length) await TeamModel.insertMany(team);
  console.log(`  \u2713 ${'Team members'.padEnd(24)} ${team.length} record(s)`);

  console.log('\n[seed] Done. Start the server with: npm run dev\n');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
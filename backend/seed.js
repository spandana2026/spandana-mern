/**
 * seed.js — populates database (MongoDB or JSON mode) with sample data from
 * backend/data/*.json files.
 *
 * Usage:
 *   cd backend
 *   npm run seed
 */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'node:dns';

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
import './models/Team.js';

function readJson(file) {
  const fp = path.join(env.DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return [];
  }
}

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

export async function seedDatabase(options = { force: true }) {
  console.log(`[seed] Initializing seed process from ${env.DATA_DIR} ...`);

  for (const { name, file, model } of collections) {
    const data = readJson(file);
    if (!data || !Array.isArray(data) || data.length === 0) continue;

    if (!options.force) {
      try {
        const existing = await model.getAll();
        if (existing && Array.isArray(existing) && existing.length > 0) {
          continue;
        }
      } catch (err) {
        // proceed to seed if lookup fails
      }
    }

    await model.replaceAll(data);
    console.log(`  ✓ ${name.padEnd(24)} ${data.length} record(s) populated`);
  }

  // Seed Settings
  const live  = readJson('settings.json');
  const draft = readJson('settings_draft.json');
  if (live && typeof live === 'object' && Object.keys(live).length) {
    await Settings.saveDraft(live);
    await Settings.publish();
  }
  if (draft && typeof draft === 'object' && Object.keys(draft).length) {
    await Settings.saveDraft(draft);
  }
  console.log(`  ✓ ${'Settings'.padEnd(24)} live + draft verified`);

  // Seed Team
  try {
    const TeamModel = mongoose.model('Team');
    const team = readJson('team.json');
    if (team && Array.isArray(team) && team.length) {
      const existingTeam = await TeamModel.find();
      if (options.force || existingTeam.length === 0) {
        await TeamModel.deleteMany({});
        await TeamModel.insertMany(team);
        console.log(`  ✓ ${'Team members'.padEnd(24)} ${team.length} record(s) populated`);
      }
    }
  } catch (err) {}

  console.log('[seed] Seeding process complete.\n');
}

// Auto-run if executed directly via node backend/seed.js
const isDirectExecution = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seed.js');
if (isDirectExecution) {
  (async () => {
    await connectDB();
    await seedDatabase({ force: true });
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(0);
  })().catch(err => {
    console.error('[seed] CLI Failed:', err);
    process.exit(1);
  });
}
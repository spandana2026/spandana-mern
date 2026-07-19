import mongoose  from 'mongoose';
import fs         from 'fs';
import path       from 'path';
import { isDbConnected } from '../config/db.js';
import { env }           from '../config/env.js';

// ── Atomic write helper ────────────────────────────────────────────────────
function atomicWrite(fp, data) {
  const tmp = fp + '.tmp';
  if (!fs.existsSync(path.dirname(fp))) fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, fp);
}
function readJson(fp, fallback) {
  try { return fs.existsSync(fp) ? JSON.parse(fs.readFileSync(fp, 'utf8')) : fallback; }
  catch { return fallback; }
}

const liveFile    = path.join(env.DATA_DIR, 'settings.json');
const draftFile   = path.join(env.DATA_DIR, 'settings_draft.json');
const historyFile = path.join(env.DATA_DIR, 'settings_history.json');

// ── Mongoose schema (used when MongoDB available) ──────────────────────────
const schema = new mongoose.Schema({
  key:  { type: String, required: true, unique: true },
  data: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
const SettingsMongo = mongoose.models.Settings || mongoose.model('Settings', schema);

// ── Unified API ────────────────────────────────────────────────────────────
export const Settings = {
  async getLive() {
    if (isDbConnected()) { const d = await SettingsMongo.findOne({ key: 'live' }); return d?.data || {}; }
    return readJson(liveFile, {});
  },
  async getDraft() {
    if (isDbConnected()) { const d = await SettingsMongo.findOne({ key: 'draft' }); return d?.data || await this.getLive(); }
    return readJson(draftFile, null) || readJson(liveFile, {});
  },
  async saveDraft(data) {
    if (isDbConnected()) { await SettingsMongo.findOneAndUpdate({ key: 'draft' }, { data }, { upsert: true }); return; }
    atomicWrite(draftFile, data);
  },
  async publish() {
    const draft = await this.getDraft();
    if (isDbConnected()) {
      await SettingsMongo.findOneAndUpdate({ key: 'live' }, { data: draft }, { upsert: true });
      return draft;
    }
    const history = readJson(historyFile, []);
    const current = readJson(liveFile, {});
    history.unshift({ ...current, publishedAt: new Date().toISOString() });
    atomicWrite(historyFile, history.slice(0, 30));
    atomicWrite(liveFile, draft);
    return draft;
  },
  async getHistory() {
    if (isDbConnected()) return [];
    return readJson(historyFile, []);
  },
  // Fix: footer.tsx calls GET /api/visitor-count and POST /api/visitor-count/increment,
  // neither of which had a matching backend route. The counter is a live number
  // (not a draft-then-publish CMS field), so it's written straight to live settings.
  async incrementVisitorCount() {
    const current = await this.getLive();
    const next = (current.visitorCount || 0) + 1;
    const updated = { ...current, visitorCount: next };
    if (isDbConnected()) {
      await SettingsMongo.findOneAndUpdate({ key: 'live' }, { data: updated }, { upsert: true });
      return next;
    }
    atomicWrite(liveFile, updated);
    return next;
  },
};

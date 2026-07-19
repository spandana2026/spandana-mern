import mongoose from 'mongoose';
import bcrypt    from 'bcrypt';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const BCRYPT_ROUNDS = 12;
const jm = jsonModel(path.join(env.DATA_DIR, 'team.json'));

// ── Mongoose schema ────────────────────────────────────────────────────────
const schema = new mongoose.Schema({
  name:         { type: String, required: true },
  username:     { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, default: 'Member' },
  active:       { type: Boolean, default: true },
}, { timestamps: true });

// Never return passwordHash in API responses
schema.methods.toSafeJSON = function() {
  const o = this.toObject();
  delete o.passwordHash;
  return o;
};

const TeamMongo = mongoose.models.Team || mongoose.model('Team', schema);

// ── Fix #8: bcrypt helpers ─────────────────────────────────────────────────
export async function hashPassword(plain) { return bcrypt.hash(plain, BCRYPT_ROUNDS); }
export async function verifyPassword(plain, hash) { return bcrypt.compare(plain, hash); }

export const Team = {
  async getAll() {
    // Fix: this is used by the admin "list all team members" screen, so it
    // must return active AND inactive members — otherwise a deactivated
    // member disappears from the admin list and can never be reactivated.
    // Login (findByUsername below) is the place that should filter to active only.
    if (isDbConnected()) {
      const docs = await TeamMongo.find({});
      return docs.map(d => { const o = d.toObject(); delete o.passwordHash; return o; });
    }
    return jm.getAll().map(m => { const c = { ...m }; delete c.passwordHash; delete c.password; return c; });
  },
  async findByUsername(username) {
    if (isDbConnected()) return TeamMongo.findOne({ username, active: true });
    return jm.getAll().find(m => m.username === username && m.active !== false) || null;
  },
  async create(data) {
    const hash = await hashPassword(data.password);
    const doc  = { name: data.name, username: data.username, passwordHash: hash, role: data.role || 'Member', active: true };
    if (isDbConnected()) { const m = await TeamMongo.create(doc); const o = m.toObject(); delete o.passwordHash; return o; }
    const { password: _p, ...safe } = data;
    return jm.create({ ...safe, passwordHash: hash });
  },
  async update(id, data) {
    const update = { ...data };
    if (data.password) { update.passwordHash = await hashPassword(data.password); delete update.password; }
    if (isDbConnected()) { const m = await TeamMongo.findByIdAndUpdate(id, update, { new: true }); const o = m?.toObject(); if (o) delete o.passwordHash; return o; }
    return jm.update(id, update);
  },
  async delete(id) {
    if (isDbConnected()) return TeamMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
};

import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'community-initiatives.json'));

const schema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  icon:        { type: String, default: '🤝' },
  image:       String,
  status:      { type: String, default: 'active' },
  published:   { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });
const CommunityInitiativeMongo = mongoose.models.CommunityInitiative || mongoose.model('CommunityInitiative', schema);

export const CommunityInitiative = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? CommunityInitiativeMongo.find(filter).sort({ order: 1 }) : CommunityInitiativeMongo.find().sort({ order: 1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k, v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return CommunityInitiativeMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return CommunityInitiativeMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return CommunityInitiativeMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return CommunityInitiativeMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await CommunityInitiativeMongo.deleteMany({}); if (data.length) await CommunityInitiativeMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

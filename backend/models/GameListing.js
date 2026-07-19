import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'game-listings.json'));

const schema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  imageUrl:    String,
  emoji:       String,
  url:         String,
  embedCode:   String,
  slug:        String,
  category:    String,
  isFree:      { type: Boolean, default: true },
  isPaid:      { type: Boolean, default: false },
  price:       { type: Number, default: 0 },
  published:   { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
  featured:    { type: Boolean, default: false },
  sourceType:  { type: String, default: 'url' },
  audience:    { type: String, default: 'all' },
  playMode:    { type: String, default: 'free' },
}, { timestamps: true });
const GameListingMongo = mongoose.models.GameListing || mongoose.model('GameListing', schema);

export const GameListing = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? GameListingMongo.find(filter).sort({ order: 1 }) : GameListingMongo.find().sort({ order: 1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k, v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return GameListingMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return GameListingMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return GameListingMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return GameListingMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await GameListingMongo.deleteMany({}); if (data.length) await GameListingMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'newsletter-subscribers.json'));

const schema = new mongoose.Schema({ email:{type:String,required:true,unique:true},subscribedAt:{type:Date,default:Date.now},active:{type:Boolean,default:true} }, { timestamps: true });
const NewsletterMongo = mongoose.models.Newsletter || mongoose.model('Newsletter', schema);

export const Newsletter = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? NewsletterMongo.find(filter).sort({ createdAt: -1 }) : NewsletterMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return NewsletterMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return NewsletterMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return NewsletterMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return NewsletterMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await NewsletterMongo.deleteMany({}); if (data.length) await NewsletterMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

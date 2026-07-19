import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'events.json'));

const schema = new mongoose.Schema({ title:{type:String,required:true},date:String,time:String,location:String,description:String,image:String,category:{type:String,default:'General'},published:{type:Boolean,default:true},volunteersNeeded:{type:Number,default:0} }, { timestamps: true });
const EventMongo = mongoose.models.Event || mongoose.model('Event', schema);

export const Event = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? EventMongo.find(filter).sort({ createdAt: -1 }) : EventMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return EventMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return EventMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return EventMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return EventMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await EventMongo.deleteMany({}); if (data.length) await EventMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

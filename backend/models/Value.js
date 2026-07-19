import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'values.json'));

const schema = new mongoose.Schema({ title:{type:String,required:true},description:String,icon:String,order:{type:Number,default:0},published:{type:Boolean,default:true} }, { timestamps: true });
const ValueMongo = mongoose.models.Value || mongoose.model('Value', schema);

export const Value = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? ValueMongo.find(filter).sort({ createdAt: -1 }) : ValueMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return ValueMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return ValueMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return ValueMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return ValueMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await ValueMongo.deleteMany({}); if (data.length) await ValueMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

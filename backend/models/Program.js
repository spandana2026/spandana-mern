import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'health-programs.json'));

const schema = new mongoose.Schema({ title:{type:String,required:true},description:String,pillar:{type:String,default:'physical'},status:{type:String,default:'active'},image:String,published:{type:Boolean,default:true},order:{type:Number,default:0} }, { timestamps: true });
const ProgramMongo = mongoose.models.Program || mongoose.model('Program', schema);

export const Program = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? ProgramMongo.find(filter).sort({ createdAt: -1 }) : ProgramMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return ProgramMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return ProgramMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return ProgramMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return ProgramMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await ProgramMongo.deleteMany({}); if (data.length) await ProgramMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

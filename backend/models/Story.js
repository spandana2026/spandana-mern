import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'stories.json'));

const schema = new mongoose.Schema({ title:{type:String,required:true},personName:String,location:String,excerpt:String,story:String,imageUrl:String,published:{type:Boolean,default:true},order:{type:Number,default:0} }, { timestamps: true });
const StoryMongo = mongoose.models.Story || mongoose.model('Story', schema);

export const Story = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? StoryMongo.find(filter).sort({ createdAt: -1 }) : StoryMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return StoryMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return StoryMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return StoryMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return StoryMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await StoryMongo.deleteMany({}); if (data.length) await StoryMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

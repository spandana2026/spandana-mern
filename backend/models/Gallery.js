import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'gallery.json'));

const schema = new mongoose.Schema({ title:{type:String,default:''},caption:String,imageUrl:String,category:{type:String,default:'General'},published:{type:Boolean,default:true},order:{type:Number,default:0} }, { timestamps: true });
const GalleryMongo = mongoose.models.Gallery || mongoose.model('Gallery', schema);

export const Gallery = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? GalleryMongo.find(filter).sort({ createdAt: -1 }) : GalleryMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return GalleryMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return GalleryMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return GalleryMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return GalleryMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await GalleryMongo.deleteMany({}); if (data.length) await GalleryMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

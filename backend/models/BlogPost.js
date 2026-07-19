import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'blog-posts.json'));

const schema = new mongoose.Schema({ title:{type:String,required:true},category:{type:String,default:'General'},excerpt:String,content:String,date:String,readTime:String,image:String,published:{type:Boolean,default:true},author:String }, { timestamps: true });
const BlogPostMongo = mongoose.models.BlogPost || mongoose.model('BlogPost', schema);

export const BlogPost = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? BlogPostMongo.find(filter).sort({ createdAt: -1 }) : BlogPostMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return BlogPostMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return BlogPostMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return BlogPostMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return BlogPostMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await BlogPostMongo.deleteMany({}); if (data.length) await BlogPostMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

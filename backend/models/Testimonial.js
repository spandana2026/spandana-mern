import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'testimonials.json'));

const schema = new mongoose.Schema({ name:{type:String,required:true},role:String,text:String,image:String,rating:{type:Number,default:5},published:{type:Boolean,default:true},order:{type:Number,default:0} }, { timestamps: true });
const TestimonialMongo = mongoose.models.Testimonial || mongoose.model('Testimonial', schema);

export const Testimonial = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? TestimonialMongo.find(filter).sort({ createdAt: -1 }) : TestimonialMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return TestimonialMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return TestimonialMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return TestimonialMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return TestimonialMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await TestimonialMongo.deleteMany({}); if (data.length) await TestimonialMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

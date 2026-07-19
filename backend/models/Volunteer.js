import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';
import { jsonModel }     from './base.js';
import { env }           from '../config/env.js';
import path from 'path';

const jm = jsonModel(path.join(env.DATA_DIR, 'volunteers.json'));

const schema = new mongoose.Schema({ fullName:{type:String,required:true},email:{type:String,required:true},phone:String,age:String,dob:String,address:String,occupation:String,skills:String,areasOfInterest:[String],availability:[String],motivation:String,emergencyContactName:String,emergencyContactPhone:String,declaration:Boolean,childrenDeclaration:Boolean,submittedAt:{type:Date,default:Date.now} }, { timestamps: true });
const VolunteerMongo = mongoose.models.Volunteer || mongoose.model('Volunteer', schema);

export const Volunteer = {
  async getAll(filter = null) {
    if (isDbConnected()) return filter ? VolunteerMongo.find(filter).sort({ createdAt: -1 }) : VolunteerMongo.find().sort({ createdAt: -1 });
    return jm.getAll(filter ? r => Object.entries(filter).every(([k,v]) => r[k] === v) : null);
  },
  async getById(id) {
    if (isDbConnected()) return VolunteerMongo.findById(id);
    return jm.getById(id);
  },
  async create(data) {
    if (isDbConnected()) return VolunteerMongo.create(data);
    return jm.create(data);
  },
  async update(id, data) {
    if (isDbConnected()) return VolunteerMongo.findByIdAndUpdate(id, data, { new: true });
    return jm.update(id, data);
  },
  async delete(id) {
    if (isDbConnected()) return VolunteerMongo.findByIdAndDelete(id);
    return jm.delete(id);
  },
  async replaceAll(data) {
    if (isDbConnected()) { await VolunteerMongo.deleteMany({}); if (data.length) await VolunteerMongo.insertMany(data); return; }
    jm.replaceAll(data);
  },
};

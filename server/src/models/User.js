import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true},phone:String,password:{type:String,required:true},role:{type:String,enum:['customer','admin'],default:'customer'}},{timestamps:true});
export default mongoose.model('User',schema);

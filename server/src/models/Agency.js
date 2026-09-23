import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true},slug:{type:String,unique:true},logo:String,description:String,phone:String,email:String,address:String,website:String,active:{type:Boolean,default:true},routes:[String]},{timestamps:true});
export default mongoose.model('Agency',schema);

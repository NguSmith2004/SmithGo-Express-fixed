import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  reference:{type:String,unique:true},
  user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  agency:{type:mongoose.Schema.Types.ObjectId,ref:'Agency',required:true},
  trip:{from:String,to:String,departureDate:String,departureTime:String,seatType:String},
  passenger:{name:String,phone:String,email:String,idNumber:String},
  amount:{type:Number,required:true,min:1},
  payment:{type:mongoose.Schema.Types.ObjectId,ref:'Payment'},
  paymentStatus:{type:String,enum:['unpaid','pending','paid','failed','refunded'],default:'pending'},
  status:{type:String,enum:['pending_payment','confirmed','cancelled','completed'],default:'pending_payment'}
},{timestamps:true});
export default mongoose.model('Booking',schema);

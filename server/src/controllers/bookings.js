import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import Booking from '../models/Booking.js';

export async function create(req,res){
  try{
    const {agency,trip,passenger,amount}=req.body;
    const numericAmount=Number(amount);
    if(!agency||!trip?.from||!trip?.to||!trip?.departureDate||!trip?.departureTime||!passenger?.name||!passenger?.phone||!passenger?.email||!Number.isFinite(numericAmount)||numericAmount<=0){
      return res.status(400).json({message:'Please provide complete trip, passenger and payment details.'});
    }
    const isAdmin = req.user?.role === 'admin';
    const b=await Booking.create({
      reference:'SGX-'+crypto.randomBytes(4).toString('hex').toUpperCase(),
      user:req.user.id,
      agency,
      trip,
      passenger,
      amount:numericAmount,
      // Administrators may create complimentary/admin-issued tickets without
      // going through Flutterwave. Customers must always pay before confirmation.
      paymentStatus: isAdmin ? 'paid' : 'pending',
      status: isAdmin ? 'confirmed' : 'pending_payment'
    });
    await b.populate('agency');
    res.status(201).json({ ...b.toObject(), adminBooking: isAdmin, paymentRequired: !isAdmin });
  }catch(e){res.status(400).json({message:e.message})}
}
export async function mine(req,res){res.json(await Booking.find({user:req.user.id}).populate('agency').populate('payment').sort({createdAt:-1}))}
export async function all(req,res){res.json(await Booking.find().populate('agency user','name email').populate('payment').sort({createdAt:-1}))}
export async function cancel(req,res){const b=await Booking.findOneAndUpdate({_id:req.params.id,user:req.user.id,status:{$in:['pending_payment','confirmed']}},{status:'cancelled'},{new:true});if(!b)return res.status(404).json({message:'Booking not found or cannot be cancelled.'});res.json(b)}
export async function ticket(req,res){
  const query = req.user?.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.id };
  const b=await Booking.findOne(query).populate('agency');
  if(!b)return res.status(404).end();
  if(!['confirmed','completed'].includes(b.status))return res.status(409).json({message:'Your ticket becomes available after successful payment.'});
  res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename=${b.reference}.pdf`);
  const d=new PDFDocument({margin:50});d.pipe(res);d.fontSize(24).text('SMITHGO EXPRESS',{align:'center'}).moveDown();d.fontSize(10).text('ONLINE BOOKING TICKET',{align:'center'}).moveDown(2);d.fontSize(18).text(b.reference).moveDown();d.fontSize(12).text(`Agency: ${b.agency.name}`).text(`Passenger: ${b.passenger.name}`).text(`Phone: ${b.passenger.phone}`).text(`Route: ${b.trip.from} → ${b.trip.to}`).text(`Date: ${b.trip.departureDate}`).text(`Time: ${b.trip.departureTime}`).text(`Seat type: ${b.trip.seatType}`).text(`Amount: ${b.amount} XAF`).text(`Payment: ${b.paymentStatus}`).text(`Status: ${b.status}`).moveDown(2);d.fontSize(9).text('Please arrive at the agency before departure and present this ticket.');d.end()
}

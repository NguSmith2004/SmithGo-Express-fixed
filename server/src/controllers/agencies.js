import Agency from '../models/Agency.js';
export async function list(req,res){res.json(await Agency.find({active:true}).sort({name:1}))}
export async function all(req,res){res.json(await Agency.find().sort({createdAt:-1}))}
export async function create(req,res){try{const a=await Agency.create(req.body);res.status(201).json(a)}catch(e){res.status(400).json({message:e.message})}}
export async function update(req,res){try{const a=await Agency.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});res.json(a)}catch(e){res.status(400).json({message:e.message})}}
export async function remove(req,res){await Agency.findByIdAndUpdate(req.params.id,{active:false});res.json({message:'Agency archived'})}

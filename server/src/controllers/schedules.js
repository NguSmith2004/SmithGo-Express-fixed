import Schedule from '../models/Schedule.js';

export async function list(req, res) {
  const filter = { active: true };
  if (req.query.agency) filter.agency = req.query.agency;
  if (req.query.date) filter.departureDate = req.query.date;
  if (req.query.from) filter.from = new RegExp(`^${escapeRegex(req.query.from.trim())}$`, 'i');
  if (req.query.to) filter.to = new RegExp(`^${escapeRegex(req.query.to.trim())}$`, 'i');

  const schedules = await Schedule.find(filter)
    .populate('agency', 'name logo phone address')
    .sort({ departureDate: 1, departureTime: 1 });
  res.json(schedules);
}

export async function all(req, res) {
  const schedules = await Schedule.find()
    .populate('agency', 'name')
    .sort({ departureDate: 1, departureTime: 1 });
  res.json(schedules);
}

export async function create(req, res) {
  const { agency, from, to, departureDate, departureTime, durationMinutes, price, currency, capacity } = req.body;
  if (!agency || !from || !to || !departureDate || !departureTime || price === undefined || !capacity) {
    return res.status(400).json({ message: 'Agency, route, date, time, price and capacity are required' });
  }
  if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
    return res.status(400).json({ message: 'Departure and arrival cities must be different' });
  }

  const schedule = await Schedule.create({
    agency, from, to, departureDate, departureTime, durationMinutes,
    price: Number(price), currency, capacity: Number(capacity), availableSeats: Number(capacity)
  });
  await schedule.populate('agency', 'name logo phone address');
  res.status(201).json(schedule);
}

export async function update(req, res) {
  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

  const updates = { ...req.body };
  if (updates.capacity !== undefined) {
    const soldSeats = schedule.capacity - schedule.availableSeats;
    updates.capacity = Number(updates.capacity);
    updates.availableSeats = Math.max(0, updates.capacity - soldSeats);
  }
  const updated = await Schedule.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('agency', 'name logo phone address');
  res.json(updated);
}

export async function remove(req, res) {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
  res.json({ message: 'Schedule archived' });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

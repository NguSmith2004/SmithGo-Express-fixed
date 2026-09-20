import 'dotenv/config';
import mongoose from 'mongoose';
import Agency from '../models/Agency.js';

const agencies = [
  { name: 'Vatican Express', slug: 'vatican-express', description: 'Sample operator record. Verify current routes and contacts before publishing departures.', address: 'Douala / Yaounde', routes: ['Douala', 'Yaounde', 'Bafoussam'] },
  { name: 'Finexs Voyages', slug: 'finexs-voyages', description: 'Sample operator record for intercity travel configuration.', address: 'Douala / Yaounde', routes: ['Douala', 'Yaounde', 'Bafoussam'] },
  { name: 'Buca Voyages', slug: 'buca-voyages', description: 'Sample operator record for intercity travel configuration.', address: 'Douala / Yaounde', routes: ['Douala', 'Yaounde', 'Bamenda'] },
  { name: 'General Voyages', slug: 'general-voyages', description: 'Sample operator record for intercity travel configuration.', address: 'Douala / Yaounde', routes: ['Douala', 'Yaounde', 'Bafoussam'] },
  { name: 'Musango Bus', slug: 'musango-bus', description: 'Sample operator record for western Cameroon routes.', address: 'Bamenda / Bafoussam', routes: ['Bamenda', 'Bafoussam', 'Douala'] },
  { name: 'Amour Mezam', slug: 'amour-mezam', description: 'Sample operator record for north-west routes.', address: 'Bamenda', routes: ['Bamenda', 'Douala', 'Yaounde'] },
  { name: 'United Express', slug: 'united-express', description: 'Sample operator record for national route planning.', address: 'Douala / Yaounde', routes: ['Douala', 'Yaounde', 'Buea'] },
  { name: 'Nso Boys', slug: 'nso-boys', description: 'Sample operator record for north-west route planning.', address: 'Bamenda', routes: ['Bamenda', 'Yaounde', 'Douala'] }
];

await mongoose.connect(process.env.MONGO_URI);
for (const agency of agencies) {
  await Agency.updateOne({ name: agency.name }, { $setOnInsert: agency }, { upsert: true });
}
console.log(`Seeded ${agencies.length} agency records. Verify each operator before accepting real bookings.`);
await mongoose.disconnect();

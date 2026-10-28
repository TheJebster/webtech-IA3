// Seeds demo accounts (and, later, sample data). Safe to run repeatedly.
// Usage: npm run seed            -> upsert demo data
//        npm run seed -- --reset -> wipe collections first
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Activity from './models/Activity.js';
import Equipment from './models/Equipment.js';
import Rental from './models/Rental.js';
import { EQUIPMENT, DEMO_RENTALS, DEMO_HISTORY } from './seedData.js';
import GALLERY from './galleryData.json' with { type: 'json' };
import { countDays } from './utils/rentalPricing.js';

export const DEMO_USERS = [
  { name: 'Admin', email: 'admin@rentkit.com', password: 'Admin@123', role: 'admin', phone: '9876543210' },
  { name: 'Riya Sharma', email: 'user@rentkit.com', password: 'User@1234', role: 'user', phone: '9123456780' },
  { name: 'Arjun Nair', email: 'arjun@rentkit.com', password: 'Arjun@1234', role: 'user', phone: '9001122334' },
  { name: 'Meera Iyer', email: 'meera@rentkit.com', password: 'Meera@1234', role: 'user', phone: '9445566778' },
  { name: 'Karthik Rao', email: 'karthik@rentkit.com', password: 'Karthik@1234', role: 'user', phone: '9887766554' },
];

async function seedUsers() {
  for (const data of DEMO_USERS) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      console.log(`  • user exists: ${data.email}`);
      continue;
    }
    await User.create(data);
    console.log(`  + user created: ${data.email} (${data.role})`);
  }
}

async function seedEquipment() {
  const admin = await User.findOne({ role: 'admin' });
  let created = 0;
  for (const data of EQUIPMENT) {
    const gallery = GALLERY[data.name] || [];
    const existing = await Equipment.findOne({ name: data.name });
    if (existing) {
      // Add product photos to databases seeded before galleries existed, without touching admin edits
      if (!existing.gallery?.length && gallery.length) {
        existing.gallery = gallery;
        await existing.save();
      }
      continue;
    }
    await Equipment.create({ ...data, gallery, createdBy: admin?._id });
    created++;
  }
  console.log(`  + ${created} equipment items created (${EQUIPMENT.length - created} already existed)`);
}

const DAY_MS = 24 * 60 * 60 * 1000;
const dayFromToday = (offset) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return new Date(d.getTime() + offset * DAY_MS);
};
const ago = (days, hours = 0) => new Date(Date.now() - days * DAY_MS - hours * 3600 * 1000);

// Demo rentals in every status, dated relative to today, plus matching activity entries.
// Inserted through the raw collection so the back-dated timestamps are kept.
async function seedRentals() {
  if (await Rental.exists({})) {
    console.log('  • rentals exist, skipping');
    return;
  }
  const admin = await User.findOne({ role: 'admin' });
  const users = Object.fromEntries((await User.find({ role: 'user' })).map((u) => [u.email, u]));
  const equipment = Object.fromEntries((await Equipment.find()).map((e) => [e.name, e]));

  const rentals = [];
  const activities = [];
  for (const r of [...DEMO_HISTORY, ...DEMO_RENTALS]) {
    const user = users[r.customer];
    const startDate = dayFromToday(r.start);
    const endDate = dayFromToday(r.end);
    const days = countDays(startDate, endDate);
    const items = r.items.map(([name, quantity]) => {
      const eq = equipment[name];
      return { equipment: eq._id, name: eq.name, category: eq.category, imageUrl: eq.imageUrl || eq.gallery?.[0]?.src || '', dailyRate: eq.dailyRate, quantity, subtotal: eq.dailyRate * quantity * days };
    });
    const _id = new mongoose.Types.ObjectId();
    const code = `RK-${_id.toString().slice(-6).toUpperCase()}`;
    const createdAt = ago(r.requestedDaysAgo, 3);
    const decided = r.status !== 'pending' && r.status !== 'cancelled';
    const decidedAt = decided ? ago(Math.max(r.requestedDaysAgo - 1, 0), 1) : undefined;
    rentals.push({
      _id, user: user._id, customerName: user.name, customerEmail: user.email,
      eventName: r.eventName, venue: r.venue, notes: r.notes || '', startDate, endDate, days, items,
      totalCost: items.reduce((sum, i) => sum + i.subtotal, 0), status: r.status, adminNote: r.adminNote || '',
      ...(decided && { decidedBy: admin._id, decidedAt }), createdAt, updatedAt: decidedAt || createdAt,
    });
    activities.push({ actor: user._id, actorName: user.name, action: 'rental.create', entity: 'rental', entityId: _id, message: `requested rental ${code} for "${r.eventName}"`, createdAt });
    if (decided) {
      activities.push({ actor: admin._id, actorName: admin.name, action: `rental.${r.status}`, entity: 'rental', entityId: _id, message: `marked rental ${code} as ${r.status}`, createdAt: decidedAt });
    }
    if (r.status === 'cancelled') {
      activities.push({ actor: user._id, actorName: user.name, action: 'rental.cancel', entity: 'rental', entityId: _id, message: `cancelled rental ${code}`, createdAt: ago(r.requestedDaysAgo - 1) });
    }
  }
  await Rental.collection.insertMany(rentals);
  await Activity.collection.insertMany(activities);
  console.log(`  + ${rentals.length} demo rentals created`);
}

async function run() {
  await connectDB();
  if (process.argv.includes('--reset')) {
    console.log('Resetting collections…');
    await Promise.all([User.deleteMany({}), Activity.deleteMany({}), Equipment.deleteMany({}), Rental.deleteMany({})]);
  }
  console.log('Seeding users…');
  await seedUsers();
  console.log('Seeding equipment…');
  await seedEquipment();
  console.log('Seeding demo rentals…');
  await seedRentals();
  console.log('Done.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

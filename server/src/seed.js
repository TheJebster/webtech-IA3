// Seeds demo accounts (and, later, sample data). Safe to run repeatedly.
// Usage: npm run seed            -> upsert demo data
//        npm run seed -- --reset -> wipe collections first
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Activity from './models/Activity.js';
import Equipment from './models/Equipment.js';
import { EQUIPMENT } from './seedData.js';

export const DEMO_USERS = [
  { name: 'Admin', email: 'admin@rentkit.com', password: 'Admin@123', role: 'admin', phone: '9876543210' },
  { name: 'Riya Sharma', email: 'user@rentkit.com', password: 'User@1234', role: 'user', phone: '9123456780' },
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
    if (await Equipment.exists({ name: data.name })) continue;
    await Equipment.create({ ...data, createdBy: admin?._id });
    created++;
  }
  console.log(`  + ${created} equipment items created (${EQUIPMENT.length - created} already existed)`);
}

async function run() {
  await connectDB();
  if (process.argv.includes('--reset')) {
    console.log('Resetting collections…');
    await Promise.all([User.deleteMany({}), Activity.deleteMany({}), Equipment.deleteMany({})]);
  }
  console.log('Seeding users…');
  await seedUsers();
  console.log('Seeding equipment…');
  await seedEquipment();
  console.log('Done.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

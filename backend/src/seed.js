/**
 * Seed Script — Creates the initial Admin account
 *
 * Usage:
 *   npm run seed
 *
 * Reads credentials from .env:
 *   ADMIN_USERNAME and ADMIN_PASSWORD
 *
 * Safe to re-run: will skip if admin already exists.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin@1234';

    // Check if admin already exists
    const existing = await Admin.findOne({ username });

    if (existing) {
      console.log(`ℹ️  Admin "${username}" already exists. No action taken.`);
      process.exit(0);
    }

    // Create admin — password will be hashed by the pre-save hook in Admin.js
    await Admin.create({ username, password });

    console.log(`\n🎉 Admin created successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`\n⚠️  IMPORTANT: Change your password after first login!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();

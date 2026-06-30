/* eslint-disable no-console */
import { RepositoryFactory } from '@community-os/repositories';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { env } from './env';

const MONGODB_URI = process.env.MONGODB_URI || env.MONGODB_URI;

const userRepository = RepositoryFactory.createUserRepository({ engine: 'mongo' });

async function createAdmin(): Promise<void> {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@demo.com').toLowerCase();
  const adminPasswordText = process.env.ADMIN_PASSWORD || 'demo123';

  const existingUser = await userRepository.findByEmail(adminEmail);
  if (existingUser) {
    console.log(`User ${adminEmail} already exists. Updating password...`);
    const passwordHash = await bcrypt.hash(adminPasswordText, 10);
    // Find the user model directly to update password
    const UserMongoose = mongoose.model('User');
    await UserMongoose.updateOne({ email: adminEmail }, { password: passwordHash });
    console.log('Password updated successfully.');
  } else {
    console.log(`Creating admin account: ${adminEmail}...`);
    const passwordHash = await bcrypt.hash(adminPasswordText, 10);
    await userRepository.create({
      name: 'Admin User',
      email: adminEmail,
      password: passwordHash,
      role: 'admin',
      ward: 'Central Control',
      points: 1000,
      issues_reported: 0,
      savedLocations: [],
      achievements: [],
    });
    console.log('Admin account created successfully.');
  }

  await mongoose.disconnect();
  console.log('Disconnected. Done.');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});

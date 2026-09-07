import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const migrateUserProgress = async () => {
  await connectDB();

  let createdCount = 0;
  const users = User.find({}, { _id: 1 }).cursor();

  for await (const user of users) {
    const result = await UserProgress.updateOne(
      { userId: user._id },
      { $setOnInsert: { userId: user._id } },
      { upsert: true },
    );

    createdCount += result.upsertedCount;
  }

  console.log(`UserProgress migration complete. Created ${createdCount} record(s).`);
};

try {
  await migrateUserProgress();
} catch (error) {
  console.error(`UserProgress migration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/user.js';

dotenv.config();

const ADMIN_EMAIL    = 'adminfaraz@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists:', ADMIN_EMAIL);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    role:             'admin',
    userName:         'admin_faraz',
    email:            ADMIN_EMAIL,
    contactNumber:    '+923000000000',
    password:         hashedPassword,
    profileCompleted: true,
    status:           'approved',
    approvedByAdmin:  true,
  });

  console.log('Admin created successfully');
  console.log('Email:   ', ADMIN_EMAIL);
  console.log('Password:', ADMIN_PASSWORD);

  await mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

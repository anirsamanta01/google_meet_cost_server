import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error('MONGO_URL is not configured');
  }

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 5000
  });

  console.log(`Connected to MongoDB at ${mongoose.connection.host}`);
};

export default connectDB;

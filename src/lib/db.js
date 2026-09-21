import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nandinisahu128_db_user:vRFQbA7K4QDUZlqU@cluster0.f15iylt.mongodb.net/?appName=Cluster0";

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      console.log(`MONGO CONNECTED DB HOST: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

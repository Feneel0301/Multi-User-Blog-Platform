import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uris = [
  process.env.MONGO_URI,
  "mongodb+srv://feneelsolanki111_db_user:AH3mMV7uj5IpFBvG@multiuserblogplatform.uckjqe1.mongodb.net/?appName=MultiUserBlogPlatform",
  "mongodb://127.0.0.1:27017/blog-platform"
];

async function testConnection() {
  for (let uri of uris) {
    if (!uri) continue;
    console.log(`Testing connection to: ${uri.split("@").pop()}`);
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`SUCCESS! Connected to host: ${conn.connection.host}`);
      await mongoose.disconnect();
      return;
    } catch (err) {
      console.error(`FAILED: ${err.message}\n`);
    }
  }
  console.log("All connections failed.");
}

testConnection();

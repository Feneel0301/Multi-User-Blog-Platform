import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary Service configured successfully.");
} else {
  console.warn("WARNING: Cloudinary credentials missing from .env. Uploads will fall back to local disk storage.");
}

export { cloudinary, isCloudinaryConfigured };

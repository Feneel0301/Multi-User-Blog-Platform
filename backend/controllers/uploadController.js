import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Multer with memory storage
const storage = multer.memoryStorage();

// Wrap the Multer configuration to intercept file format and size errors gracefully
export const upload = (req, res, next) => {
  const multerUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit size to 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed."));
      }
    }
  }).single("image");

  multerUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// @desc    Upload an image file (Cloudinary stream or local fallback)
// @route   POST /api/upload
// @access  Private (CREATOR only)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded. Please send a file under key 'image'." });
    }

    if (isCloudinaryConfigured) {
      // 1. Upload to Cloudinary via a stream wrapper
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "blog_platform" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await uploadStream();
      return res.status(200).json({ url: result.secure_url });
    } else {
      // 2. Fallback: Save file locally in backend/uploads
      const uploadsFolder = path.join(__dirname, "../uploads");
      
      // Ensure the local uploads directory exists
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder, { recursive: true });
      }

      // Generate a unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(req.file.originalname) || ".jpg";
      const filename = `${uniqueSuffix}${fileExtension}`;
      
      const filePath = path.join(uploadsFolder, filename);

      // Write buffer to local folder
      await fs.promises.writeFile(filePath, req.file.buffer);

      // Construct local server static asset URL
      const port = process.env.PORT || 5000;
      const localUrl = `http://localhost:${port}/uploads/${filename}`;
      
      return res.status(200).json({ url: localUrl });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: `Image upload failed: ${error.message}` });
  }
};

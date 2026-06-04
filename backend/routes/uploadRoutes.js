import express from "express";
import { upload, uploadImage } from "../controllers/uploadController.js";
import { protect, creatorOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only authenticated creators are authorized to upload files
router.post("/", protect, creatorOnly, upload, uploadImage);

export default router;

import express from "express";
import { registerUser, loginUser, googleAuth, upgradeToCreator } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route mappings
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.put("/upgrade", protect, upgradeToCreator);

export default router;

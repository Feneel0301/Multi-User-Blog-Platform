import express from "express";
import { registerUser, loginUser, googleAuth, upgradeToCreator, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route mappings
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.put("/upgrade", protect, upgradeToCreator);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

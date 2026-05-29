import express from "express";
import { registerUser, loginUser, googleAuth } from "../controllers/authController.js";

const router = express.Router();

// Route mappings
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth)

export default router;

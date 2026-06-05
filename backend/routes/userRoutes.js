import express from 'express';
import { getUserProfile, toggleBookmark } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Profile retrieval
router.get('/profile', protect, getUserProfile);

// Bookmark toggling
router.post('/bookmark/:postId', protect, toggleBookmark);

export default router;

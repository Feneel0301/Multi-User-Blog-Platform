import express from 'express';
import { createPost, getPosts, getPostBySlug } from '../controllers/postController.js';
import { protect, creatorOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// The GET route is public. The POST route is protected by TWO security checkpoints.
router.route('/')
  .get(getPosts)
  .post(protect, creatorOnly, createPost); 

// Dynamic SEO slug route
router.get('/:slug', getPostBySlug);

export default router;
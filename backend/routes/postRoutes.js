import express from 'express';
import { 
  createPost, 
  getPosts, 
  getPostBySlug, 
  updatePost, 
  deletePost, 
  getMyPosts,
  getPostById,
  restorePost,
  deletePostPermanent,
  recordView
} from '../controllers/postController.js';
import { protect, creatorOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public listing feed & creator post creation
router.route('/')
  .get(getPosts)
  .post(protect, creatorOnly, createPost);

// Creator dashboard inventory retrieval (MUST be defined before public slug route)
router.get('/my-posts', protect, creatorOnly, getMyPosts);
router.get('/by-id/:id', protect, creatorOnly, getPostById);

router.post('/:id/view', recordView);
router.put('/:id/restore', protect, creatorOnly, restorePost);
router.delete('/:id/permanent', protect, creatorOnly, deletePostPermanent);

// Dynamic SEO slug route
router.get('/:slug', getPostBySlug);

// Creator CRUD updates & deletions
router.route('/:id')
  .put(protect, creatorOnly, updatePost)
  .delete(protect, creatorOnly, deletePost);

export default router;
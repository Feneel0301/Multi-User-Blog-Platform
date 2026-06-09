import Post from "../models/Post.js";
import View from "../models/View.js";
import jwt from "jsonwebtoken";

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private (CREATOR only)
export const createPost = async (req, res) => {
  try {
    const {
      title,
      slug,
      htmlContent,
      category,
      coverImage,
      excerpt,
      seoKeywords,
      status,
    } = req.body;

    // Handle draft fallbacks
    let finalTitle = title;
    let finalSlug = slug;
    if (status === "DRAFT") {
      if (!finalTitle || finalTitle.trim() === "") {
        finalTitle = "Untitled Draft";
      }
      if (!finalSlug || finalSlug.trim() === "") {
        finalSlug = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    // Ensure the slug is unique
    let isSlugTaken = true;
    let baseSlug = finalSlug;
    let loopCount = 0;
    while (isSlugTaken && loopCount < 10) {
      const existing = await Post.findOne({ slug: finalSlug });
      if (!existing) {
        isSlugTaken = false;
      } else {
        finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        loopCount++;
      }
    }

    // Create the post and link it to the user who made the request (req.user is set by our protect middleware)
    const post = await Post.create({
      title: finalTitle,
      slug: finalSlug,
      htmlContent,
      category,
      coverImage,
      excerpt,
      seoKeywords,
      status,
      authorId: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    // Handle duplicate slug errors gracefully
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "A post with this URL slug already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all published posts (with Search, Filtering, and Pagination)
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    // 1. Pagination Setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page
    const skip = (page - 1) * limit;

    // 2. Search Logic (Looks in both the title and custom SEO keywords)
    const searchQuery = req.query.search
      ? {
          $or: [
            { title: { $regex: req.query.search, $options: "i" } },
            { seoKeywords: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // 3. Category Filter
    const categoryQuery = req.query.category
      ? { category: req.query.category }
      : {};

    // 4. Combine queries (Only fetch PUBLISHED posts for the public feed, and exclude soft-deleted posts)
    const query = { ...searchQuery, ...categoryQuery, status: "PUBLISHED", isDeleted: { $ne: true } };

    // 5. Execute database query
    const posts = await Post.find(query)
      .populate("authorId", "name") // Pulls the author's name from the User table
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Count total documents to help the frontend build pagination UI (e.g., "Page 1 of 5")
    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single post by its SEO slug
// @route   GET /api/posts/:slug
// @access  Public
export const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, isDeleted: { $ne: true } }).populate(
      "authorId",
      "name",
    );

    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a blog post
// @route   PUT /api/posts/:id
// @access  Private (CREATOR only)
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Data Ownership Verification
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access Denied: You do not own this article" });
    }

    const { title, slug, htmlContent, category, coverImage, excerpt, seoKeywords, status } = req.body;

    // Handle draft fallbacks
    let finalTitle = title !== undefined ? title : post.title;
    let finalSlug = slug !== undefined ? slug : post.slug;
    let finalStatus = status !== undefined ? status : post.status;

    if (finalStatus === "DRAFT") {
      if (!finalTitle || finalTitle.trim() === "") {
        finalTitle = "Untitled Draft";
      }
      if (!finalSlug || finalSlug.trim() === "") {
        finalSlug = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    // Ensure the slug is unique if it is being changed
    let isSlugTaken = true;
    let baseSlug = finalSlug;
    let loopCount = 0;
    while (isSlugTaken && loopCount < 10) {
      const existing = await Post.findOne({ slug: finalSlug, _id: { $ne: post._id } });
      if (!existing) {
        isSlugTaken = false;
      } else {
        finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        loopCount++;
      }
    }

    // Update fields
    post.title = finalTitle;
    post.slug = finalSlug;
    post.htmlContent = htmlContent !== undefined ? htmlContent : post.htmlContent;
    post.category = category !== undefined ? category : post.category;
    post.coverImage = coverImage !== undefined ? coverImage : post.coverImage;
    post.excerpt = excerpt !== undefined ? excerpt : post.excerpt;
    post.seoKeywords = seoKeywords !== undefined ? seoKeywords : post.seoKeywords;
    post.status = finalStatus;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A post with this URL slug already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a blog post (Soft delete to Trash)
// @route   DELETE /api/posts/:id
// @access  Private (CREATOR only)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Data Ownership Verification
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access Denied: You do not own this article" });
    }

    // Soft delete: move to Trash
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.json({ message: "Article moved to Trash successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts by the logged-in creator (DRAFT and PUBLISHED, supports trash parameter)
// @route   GET /api/posts/my-posts
// @access  Private (CREATOR only)
export const getMyPosts = async (req, res) => {
  try {
    const isTrash = req.query.trash === "true";
    const query = {
      authorId: req.user._id,
      isDeleted: isTrash ? true : { $ne: true }
    };
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single post by ID (for edit view, excluding deleted ones)
// @route   GET /api/posts/by-id/:id
// @access  Private (CREATOR only)
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Verify ownership
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access Denied: You do not own this article" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore a soft-deleted post from Trash
// @route   PUT /api/posts/:id/restore
// @access  Private (CREATOR only)
export const restorePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Verify ownership
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access Denied: You do not own this article" });
    }

    if (!post.isDeleted) {
      return res.status(400).json({ message: "Post is not in Trash" });
    }

    post.isDeleted = false;
    post.deletedAt = undefined;
    await post.save();

    res.json({ message: "Post restored successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post permanently from database (must be in Trash)
// @route   DELETE /api/posts/:id/permanent
// @access  Private (CREATOR only)
export const deletePostPermanent = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Verify ownership
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access Denied: You do not own this article" });
    }

    if (!post.isDeleted) {
      return res.status(400).json({ message: "Post must be in Trash to be permanently deleted" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post permanently deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a unique page view on an article
// @route   POST /api/posts/:id/view
// @access  Public (Optional auth)
export const recordView = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Determine viewer identity
    let viewerId = req.body.visitorId || req.ip;

    // Check if optional auth headers are present
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          viewerId = decoded.id;
        }
      } catch (err) {
        // Stale/invalid token, fallback to visitorId or IP
      }
    }

    try {
      // Attempt to record view (unique index prevents duplicates)
      await View.create({ postId, viewerId });
      
      // Increment views count on the post
      post.viewsCount = (post.viewsCount || 0) + 1;
      await post.save();
    } catch (dbError) {
      // Catch duplicate key error (code 11000) and ignore it
      if (dbError.code !== 11000) {
        throw dbError;
      }
    }

    res.json({ viewsCount: post.viewsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

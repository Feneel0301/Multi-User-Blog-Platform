import Post from "../models/Post.js";

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

    // Create the post and link it to the user who made the request (req.user is set by our protect middleware)
    const post = await Post.create({
      title,
      slug,
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

    // 4. Combine queries (Only fetch PUBLISHED posts for the public feed)
    const query = { ...searchQuery, ...categoryQuery, status: "PUBLISHED" };

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
    const post = await Post.findOne({ slug: req.params.slug }).populate(
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

    // Update fields
    post.title = title !== undefined ? title : post.title;
    post.slug = slug !== undefined ? slug : post.slug;
    post.htmlContent = htmlContent !== undefined ? htmlContent : post.htmlContent;
    post.category = category !== undefined ? category : post.category;
    post.coverImage = coverImage !== undefined ? coverImage : post.coverImage;
    post.excerpt = excerpt !== undefined ? excerpt : post.excerpt;
    post.seoKeywords = seoKeywords !== undefined ? seoKeywords : post.seoKeywords;
    post.status = status !== undefined ? status : post.status;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "A post with this URL slug already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a blog post
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

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts by the logged-in creator (DRAFT and PUBLISHED)
// @route   GET /api/posts/my-posts
// @access  Private (CREATOR only)
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single post by ID (for edit view)
// @route   GET /api/posts/by-id/:id
// @access  Private (CREATOR only)
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
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


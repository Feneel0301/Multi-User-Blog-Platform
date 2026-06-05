import User from "../models/User.js";
import Post from "../models/Post.js";

// @desc    Get user profile with created and saved posts
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user details & populate saved posts
    // We only want saved posts that are PUBLISHED and not deleted
    const user = await User.findById(userId)
      .select("-passwordHash")
      .populate({
        path: "savedPosts",
        match: { isDeleted: { $ne: true }, status: "PUBLISHED" },
        populate: {
          path: "authorId",
          select: "name email",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch created posts (excluding deleted ones, but including drafts since it's the owner's profile)
    const createdPosts = await Post.find({
      authorId: userId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      user,
      createdPosts,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle saved/bookmark status on a post
// @route   POST /api/users/bookmark/:postId
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    // 1. Verify the post exists and is published/not deleted
    const post = await Post.findOne({ _id: postId, isDeleted: { $ne: true }, status: "PUBLISHED" });
    if (!post) {
      return res.status(404).json({ message: "Post not found or is not available for bookmarking" });
    }

    // 2. Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check if already bookmarked
    const isBookmarked = user.savedPosts.includes(postId);

    if (isBookmarked) {
      // Remove post ID
      user.savedPosts.pull(postId);
    } else {
      // Add post ID
      user.savedPosts.push(postId);
    }

    await user.save();

    res.status(200).json({
      bookmarked: !isBookmarked,
      message: isBookmarked ? "Article removed from bookmarks." : "Article saved to bookmarks.",
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({ message: error.message });
  }
};

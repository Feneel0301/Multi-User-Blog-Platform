import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    viewerId: {
      type: String, // Representing userId (if authenticated) or anonymous visitor UUID
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Enforce unique views per user/visitor per article
viewSchema.index({ postId: 1, viewerId: 1 }, { unique: true });

export default mongoose.model("View", viewSchema);

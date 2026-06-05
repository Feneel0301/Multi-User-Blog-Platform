import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: function() { return this.status === 'PUBLISHED'; }
    },
    slug: { 
      type: String, 
      required: function() { return this.status === 'PUBLISHED'; }, 
      unique: true, 
      sparse: true,
      index: true // Indexed for faster SEO routing
    },
    htmlContent: { 
      type: String, 
      required: function() { return this.status === 'PUBLISHED'; }
    },
    category: { 
      type: String, 
      required: function() { return this.status === 'PUBLISHED'; }
    },
    coverImage: { 
      type: String 
    },
    excerpt: { 
      type: String, 
      required: function() { return this.status === 'PUBLISHED'; }
    },
    seoKeywords: { 
      type: String 
    }, // Comma-separated search engine indexing strings
    status: { 
      type: String, 
      enum: ['DRAFT', 'PUBLISHED'], 
      default: 'DRAFT' 
    },
    authorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', // Relational link mapping back to the User model
      required: true 
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    deleteVerificationCode: {
      type: String
    },
    deleteVerificationExpires: {
      type: Date
    },
    viewsCount: {
      type: Number,
      default: 0
    }
  }, 
  { 
    timestamps: true 
  }
);

export default mongoose.model('Post', postSchema);
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true // Indexed for faster SEO routing
    },
    htmlContent: { 
      type: String, 
      required: true 
    },
    category: { 
      type: String, 
      required: true 
    },
    coverImage: { 
      type: String 
    },
    excerpt: { 
      type: String, 
      required: true 
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
    }
  }, 
  { 
    timestamps: true 
  }
);

export default mongoose.model('Post', postSchema);
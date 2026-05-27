import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    passwordHash: { 
      type: String 
    }, // This is optional to allow for pure OAuth logins later
    role: { 
      type: String, 
      enum: ['VISITOR', 'CREATOR'], 
      default: 'VISITOR' 
    }
  }, 
  { 
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
  }
);

// Security Layer: Pre-save hook to hash the password before saving to the database
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return;
  
  // Generate a secure salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

export default mongoose.model('User', userSchema);
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  stage_name: string;
  university_email: string;
  password: string;
  is_email_verified: boolean;
  disclosure_preferences: {
    university_visibility: boolean;
  };
  blocked_users: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  stage_name: {
    type: String,
    required: [true, 'Stage name is required'],
    trim: true,
    minlength: [2, 'Stage name must be at least 2 characters long'],
    maxlength: [50, 'Stage name cannot exceed 50 characters']
  },
  university_email: {
    type: String,
    required: [true, 'University email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  disclosure_preferences: {
    university_visibility: {
      type: Boolean,
      default: false
    }
  },
  blocked_users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
userSchema.index({ university_email: 1 });
userSchema.index({ stage_name: 1 });

export default mongoose.model<IUser>('User', userSchema);


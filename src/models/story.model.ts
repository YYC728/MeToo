import mongoose, { Document, Schema } from 'mongoose';

export interface IMeTooStory extends Document {
  user_id: mongoose.Types.ObjectId | null; // Null for anonymous posts
  text_content: string;
  media_attachments: string[]; // URLs to media files
  privacy_level: 'public' | 'restricted' | 'anonymous';
  tags: string[];
  comment_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

const meTooStorySchema = new Schema<IMeTooStory>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null for anonymous posts
  },
  text_content: {
    type: String,
    required: [true, 'Text content is required'],
    trim: true,
    minlength: [10, 'Story must be at least 10 characters long'],
    maxlength: [5000, 'Story cannot exceed 5000 characters']
  },
  media_attachments: [{
    type: String,
    trim: true,
    validate: {
      validator: function(url: string) {
        // Basic URL validation
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid media URL'
    }
  }],
  privacy_level: {
    type: String,
    enum: ['public', 'restricted', 'anonymous'],
    required: [true, 'Privacy level is required'],
    default: 'restricted'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  comment_enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
meTooStorySchema.index({ user_id: 1, created_at: -1 });
meTooStorySchema.index({ privacy_level: 1, created_at: -1 });
meTooStorySchema.index({ tags: 1, created_at: -1 });
meTooStorySchema.index({ comment_enabled: 1, created_at: -1 });

// Pre-save hook to handle anonymity
meTooStorySchema.pre('save', function(next) {
  if (this.privacy_level === 'anonymous') {
    this.user_id = null;
  }
  next();
});

export default mongoose.model<IMeTooStory>('MeTooStory', meTooStorySchema);

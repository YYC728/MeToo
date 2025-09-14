import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  story_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId | null; // Null for anonymous comments
  text_content: string;
  created_at: Date;
  updated_at: Date;
}

const commentSchema = new Schema<IComment>({
  story_id: {
    type: Schema.Types.ObjectId,
    ref: 'MeTooStory',
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null for anonymous comments
  },
  text_content: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
commentSchema.index({ story_id: 1, created_at: 1 });
commentSchema.index({ user_id: 1, created_at: -1 });

export default mongoose.model<IComment>('Comment', commentSchema);


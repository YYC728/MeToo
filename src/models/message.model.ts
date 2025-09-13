import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender_id: mongoose.Types.ObjectId;
  receiver_id: mongoose.Types.ObjectId;
  content: string;
  created_at: Date;
  updated_at: Date;
}

const messageSchema = new Schema<IMessage>({
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
messageSchema.index({ sender_id: 1, created_at: -1 });
messageSchema.index({ receiver_id: 1, created_at: -1 });
messageSchema.index({ sender_id: 1, receiver_id: 1, created_at: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);

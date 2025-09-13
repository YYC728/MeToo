import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailVerificationToken extends Document {
  user_id: mongoose.Types.ObjectId;
  token: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires_at: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  },
  is_used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Create indexes
emailVerificationTokenSchema.index({ token: 1 });
emailVerificationTokenSchema.index({ user_id: 1 });
emailVerificationTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model<IEmailVerificationToken>('EmailVerificationToken', emailVerificationTokenSchema);

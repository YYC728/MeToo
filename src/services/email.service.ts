import crypto from 'crypto';
import EmailVerificationToken from '../models/emailVerification.model';
import User from '../models/user.model';

export class EmailService {
  /**
   * Generate a unique verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create and save a verification token for a user
   */
  async createVerificationToken(userId: string): Promise<string> {
    // Delete any existing tokens for this user
    await EmailVerificationToken.deleteMany({ user_id: userId });

    // Generate new token
    const token = this.generateVerificationToken();

    // Create and save the token
    const verificationToken = new EmailVerificationToken({
      user_id: userId,
      token,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await verificationToken.save();

    return token;
  }

  /**
   * Send verification email (mocked for now)
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Mailgun
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    console.log('='.repeat(60));
    console.log('📧 EMAIL VERIFICATION (MOCKED)');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your email address`);
    console.log('');
    console.log('Please click the following link to verify your email:');
    console.log(verificationUrl);
    console.log('');
    console.log('This link will expire in 24 hours.');
    console.log('='.repeat(60));
    
    // In production, replace this with actual email sending:
    // await this.sendActualEmail(email, verificationUrl);
  }

  /**
   * Verify email token and update user status
   */
  async verifyEmailToken(token: string): Promise<{ success: boolean; user?: any; message: string }> {
    try {
      // Find the token
      const verificationToken = await EmailVerificationToken.findOne({ 
        token,
        is_used: false 
      });

      if (!verificationToken) {
        return {
          success: false,
          message: 'Invalid or expired verification token'
        };
      }

      // Check if token is expired
      if (verificationToken.expires_at < new Date()) {
        await EmailVerificationToken.deleteOne({ _id: verificationToken._id });
        return {
          success: false,
          message: 'Verification token has expired'
        };
      }

      // Update user's email verification status
      const user = await User.findByIdAndUpdate(
        verificationToken.user_id,
        { is_email_verified: true },
        { new: true }
      );

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Mark token as used
      verificationToken.is_used = true;
      await verificationToken.save();

      return {
        success: true,
        user: {
          _id: user._id,
          stage_name: user.stage_name,
          university_email: user.university_email,
          is_email_verified: user.is_email_verified
        },
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  /**
   * Send verification email to user after registration
   */
  async sendUserVerificationEmail(userId: string, userEmail: string): Promise<void> {
    try {
      const token = await this.createVerificationToken(userId);
      await this.sendVerificationEmail(userEmail, token);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }
}

export default new EmailService();

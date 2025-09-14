import { Request, Response } from 'express';
import emailService from '../services/email.service';

/**
 * Verify email with token
 * GET /api/auth/verify-email/:token
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
      return;
    }

    const result = await emailService.verifyEmailToken(token);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { university_email } = req.body;

    if (!university_email) {
      res.status(400).json({
        success: false,
        message: 'University email is required'
      });
      return;
    }

    // Find user by email
    const User = (await import('../models/user.model')).default;
    const user = await User.findOne({ university_email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.is_email_verified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
      return;
    }

    // Send verification email
    await emailService.sendUserVerificationEmail((user._id as any).toString(), user.university_email);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


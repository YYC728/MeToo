import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import emailService from '../services/email.service';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { stage_name, university_email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ university_email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user
    const user = new User({
      stage_name,
      university_email,
      password
    });

    await user.save();

    // Send verification email
    try {
      await emailService.sendUserVerificationEmail((user._id as any).toString(), user.university_email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email sending fails
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      stage_name: user.stage_name,
      university_email: user.university_email,
      is_email_verified: user.is_email_verified,
      disclosure_preferences: user.disclosure_preferences,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { university_email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ university_email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if email is verified
    if (!user.is_email_verified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user and token
    const userResponse = {
      _id: user._id,
      stage_name: user.stage_name,
      university_email: user.university_email,
      is_email_verified: user.is_email_verified,
      disclosure_preferences: user.disclosure_preferences
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

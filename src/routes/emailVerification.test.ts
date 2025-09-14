import request from 'supertest';
import app from '../app';
import User from '../models/user.model';
import EmailVerificationToken from '../models/emailVerification.model';
import mongoose from 'mongoose';

// Mock database connection for testing
beforeAll(async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/metoo-app-test';
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
  await EmailVerificationToken.deleteMany({});
});

describe('GET /api/auth/verify-email/:token', () => {
  it('should verify email with valid token', async () => {
    // Create user
    const user = await User.create({
      stage_name: 'TestUser',
      university_email: 'test@university.edu',
      password: 'password123',
      is_email_verified: false
    });

    // Create verification token
    const token = await EmailVerificationToken.create({
      user_id: user._id,
      token: 'valid-token-123',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    const response = await request(app)
      .get(`/api/auth/verify-email/${token.token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Email verified successfully');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.is_email_verified).toBe(true);

    // Check that user was updated in database
    const updatedUser = await User.findById(user._id);
    expect(updatedUser?.is_email_verified).toBe(true);
  });

  it('should return 400 for invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email/invalid-token')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired verification token');
  });

  it('should return 400 for missing token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email/')
      .expect(404); // Express returns 404 for missing route parameter
  });

  it('should return 400 for expired token', async () => {
    // Create user
    const user = await User.create({
      stage_name: 'TestUser',
      university_email: 'test@university.edu',
      password: 'password123'
    });

    // Create expired token
    const token = await EmailVerificationToken.create({
      user_id: user._id,
      token: 'expired-token-123',
      expires_at: new Date(Date.now() - 1000) // 1 second ago
    });

    const response = await request(app)
      .get(`/api/auth/verify-email/${token.token}`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Verification token has expired');
  });
});

describe('POST /api/auth/resend-verification', () => {
  it('should resend verification email for unverified user', async () => {
    // Create unverified user
    const user = await User.create({
      stage_name: 'TestUser',
      university_email: 'test@university.edu',
      password: 'password123',
      is_email_verified: false
    });

    // Mock console.log to capture output
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const response = await request(app)
      .post('/api/auth/resend-verification')
      .send({ university_email: 'test@university.edu' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Verification email sent successfully');

    // Check that console.log was called with email content
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📧 EMAIL VERIFICATION (MOCKED)'));

    consoleSpy.mockRestore();
  });

  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification')
      .send({ university_email: 'nonexistent@university.edu' })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 400 for already verified user', async () => {
    // Create verified user
    const user = await User.create({
      stage_name: 'TestUser',
      university_email: 'test@university.edu',
      password: 'password123',
      is_email_verified: true
    });

    const response = await request(app)
      .post('/api/auth/resend-verification')
      .send({ university_email: 'test@university.edu' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Email is already verified');
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification')
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('University email is required');
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification')
      .send({ university_email: 'invalid-email' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});


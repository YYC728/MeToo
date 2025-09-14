import mongoose from 'mongoose';
import emailService from './email.service';
import EmailVerificationToken from '../models/emailVerification.model';
import User from '../models/user.model';

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

describe('EmailService', () => {
  describe('createVerificationToken', () => {
    it('should create a verification token for a user', async () => {
      const user = await User.create({
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123'
      });

      const token = await emailService.createVerificationToken(user._id.toString());

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters

      const savedToken = await EmailVerificationToken.findOne({ user_id: user._id });
      expect(savedToken).toBeDefined();
      expect(savedToken?.token).toBe(token);
      expect(savedToken?.is_used).toBe(false);
    });

    it('should delete existing tokens when creating a new one', async () => {
      const user = await User.create({
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123'
      });

      // Create first token
      const token1 = await emailService.createVerificationToken(user._id.toString());
      
      // Create second token
      const token2 = await emailService.createVerificationToken(user._id.toString());

      expect(token1).not.toBe(token2);

      const tokens = await EmailVerificationToken.find({ user_id: user._id });
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token2);
    });
  });

  describe('verifyEmailToken', () => {
    it('should verify a valid token and update user status', async () => {
      const user = await User.create({
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123',
        is_email_verified: false
      });

      const token = await emailService.createVerificationToken(user._id.toString());
      const result = await emailService.verifyEmailToken(token);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified successfully');
      expect(result.user).toBeDefined();
      expect(result.user?.is_email_verified).toBe(true);

      // Check that user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.is_email_verified).toBe(true);

      // Check that token was marked as used
      const usedToken = await EmailVerificationToken.findOne({ token });
      expect(usedToken?.is_used).toBe(true);
    });

    it('should return error for invalid token', async () => {
      const result = await emailService.verifyEmailToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired verification token');
    });

    it('should return error for already used token', async () => {
      const user = await User.create({
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123'
      });

      const token = await emailService.createVerificationToken(user._id.toString());
      
      // Use the token once
      await emailService.verifyEmailToken(token);
      
      // Try to use it again
      const result = await emailService.verifyEmailToken(token);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or expired verification token');
    });

    it('should return error for expired token', async () => {
      const user = await User.create({
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123'
      });

      const token = await emailService.createVerificationToken(user._id.toString());
      
      // Manually set token to expired
      await EmailVerificationToken.updateOne(
        { token },
        { expires_at: new Date(Date.now() - 1000) } // 1 second ago
      );

      const result = await emailService.verifyEmailToken(token);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Verification token has expired');
    });
  });

  describe('sendUserVerificationEmail', () => {
    it('should create token and send email for user', async () => {
      const user = await User.create({
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123'
      });

      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await emailService.sendUserVerificationEmail(user._id.toString(), user.university_email);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📧 EMAIL VERIFICATION (MOCKED)'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('To: test@university.edu'));

      consoleSpy.mockRestore();
    });
  });
});


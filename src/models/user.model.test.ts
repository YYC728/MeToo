import mongoose from 'mongoose';
import User, { IUser } from './user.model';

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
});

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'plaintextpassword'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('plaintextpassword');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    it('should not hash password if it has not been modified', async () => {
      const userData = {
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'plaintextpassword'
      };

      const user = new User(userData);
      await user.save();
      const originalPassword = user.password;

      // Modify a different field
      user.stage_name = 'UpdatedName';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });

    it('should compare password correctly', async () => {
      const userData = {
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'plaintextpassword'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('plaintextpassword');
      const isNotMatch = await user.comparePassword('wrongpassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should create user with valid data', async () => {
      const userData = {
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.stage_name).toBe(userData.stage_name);
      expect(savedUser.university_email).toBe(userData.university_email);
      expect(savedUser.is_email_verified).toBe(false);
      expect(savedUser.disclosure_preferences.university_visibility).toBe(false);
      expect(savedUser.blocked_users).toEqual([]);
    });

    it('should require stage_name', async () => {
      const userData = {
        university_email: 'test@university.edu',
        password: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Stage name is required');
    });

    it('should require university_email', async () => {
      const userData = {
        stage_name: 'TestUser',
        password: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('University email is required');
    });

    it('should require password', async () => {
      const userData = {
        stage_name: 'TestUser',
        university_email: 'test@university.edu'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Password is required');
    });

    it('should validate email format', async () => {
      const userData = {
        stage_name: 'TestUser',
        university_email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow('Please enter a valid email address');
    });

    it('should enforce unique university_email', async () => {
      const userData = {
        stage_name: 'TestUser',
        university_email: 'test@university.edu',
        password: 'password123'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow('duplicate key error');
    });
  });
});


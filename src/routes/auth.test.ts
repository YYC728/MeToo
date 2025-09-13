import request from 'supertest';
import app from '../app';
import User from '../models/user.model';
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
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      stage_name: 'TestUser',
      university_email: 'test@university.edu',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User registered successfully. Please check your email to verify your account.');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.stage_name).toBe(userData.stage_name);
    expect(response.body.user.university_email).toBe(userData.university_email);
    expect(response.body.user.password).toBeUndefined();
  });

  it('should return 409 if user already exists', async () => {
    const userData = {
      stage_name: 'TestUser',
      university_email: 'test@university.edu',
      password: 'password123'
    };

    // Create user first
    await User.create(userData);

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User with this email already exists');
  });

  it('should return 400 for missing required fields', async () => {
    const userData = {
      stage_name: 'TestUser'
      // Missing university_email and password
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toBeDefined();
  });

  it('should return 400 for invalid email format', async () => {
    const userData = {
      stage_name: 'TestUser',
      university_email: 'invalid-email',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create a verified user for login tests
    const userData = {
      stage_name: 'TestUser',
      university_email: 'test@university.edu',
      password: 'password123',
      is_email_verified: true
    };
    await User.create(userData);
  });

  it('should login successfully with correct credentials', async () => {
    const loginData = {
      university_email: 'test@university.edu',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user).toBeDefined();
    expect(response.body.token).toBeDefined();
  });

  it('should return 401 for incorrect credentials', async () => {
    const loginData = {
      university_email: 'test@university.edu',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 403 for unverified email', async () => {
    // Create an unverified user
    const userData = {
      stage_name: 'UnverifiedUser',
      university_email: 'unverified@university.edu',
      password: 'password123',
      is_email_verified: false
    };
    await User.create(userData);

    const loginData = {
      university_email: 'unverified@university.edu',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Please verify your email before logging in');
  });

  it('should return 400 for missing required fields', async () => {
    const loginData = {
      university_email: 'test@university.edu'
      // Missing password
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});

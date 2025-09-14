import request from 'supertest';
import app from '../app';
import User from '../models/user.model';
import MeTooStory from '../models/story.model';
import Comment from '../models/comment.model';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

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
  await MeTooStory.deleteMany({});
  await Comment.deleteMany({});
});

// Helper function to create a test user and get auth token
const createTestUser = async (isVerified = true) => {
  const user = await User.create({
    stage_name: 'TestUser',
    university_email: 'test@university.edu',
    password: 'password123',
    is_email_verified: isVerified
  });

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );

  return { user, token };
};

describe('POST /api/stories', () => {
  it('should create a story successfully', async () => {
    const { token } = await createTestUser();

    const storyData = {
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'restricted',
      tags: ['test', 'experience'],
      comment_enabled: true
    };

    const response = await request(app)
      .post('/api/stories')
      .set('Authorization', `Bearer ${token}`)
      .send(storyData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Story created successfully');
    expect(response.body.story).toBeDefined();
    expect(response.body.story.text_content).toBe(storyData.text_content);
    expect(response.body.story.privacy_level).toBe(storyData.privacy_level);
    expect(response.body.story.user_id).toBeDefined();
  });

  it('should create an anonymous story', async () => {
    const { token } = await createTestUser();

    const storyData = {
      text_content: 'This is an anonymous test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'anonymous',
      tags: ['anonymous', 'test'],
      comment_enabled: true
    };

    const response = await request(app)
      .post('/api/stories')
      .set('Authorization', `Bearer ${token}`)
      .send(storyData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.story.user_id).toBeNull();
    expect(response.body.story.privacy_level).toBe('anonymous');
  });

  it('should return 401 for unauthenticated request', async () => {
    const storyData = {
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'restricted'
    };

    await request(app)
      .post('/api/stories')
      .send(storyData)
      .expect(401);
  });

  it('should return 400 for invalid data', async () => {
    const { token } = await createTestUser();

    const invalidStoryData = {
      text_content: 'Short', // Too short
      privacy_level: 'invalid', // Invalid privacy level
      tags: ['a'.repeat(31)] // Tag too long
    };

    const response = await request(app)
      .post('/api/stories')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidStoryData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});

describe('GET /api/stories', () => {
  beforeEach(async () => {
    // Create test stories
    const { user } = await createTestUser();
    
    await MeTooStory.create([
      {
        user_id: user._id,
        text_content: 'This is a public story about my experience. It needs to be at least 10 characters long.',
        privacy_level: 'public',
        tags: ['public', 'test'],
        comment_enabled: true
      },
      {
        user_id: user._id,
        text_content: 'This is a restricted story about my experience. It needs to be at least 10 characters long.',
        privacy_level: 'restricted',
        tags: ['restricted', 'test'],
        comment_enabled: true
      },
      {
        user_id: null,
        text_content: 'This is an anonymous story about my experience. It needs to be at least 10 characters long.',
        privacy_level: 'anonymous',
        tags: ['anonymous', 'test'],
        comment_enabled: true
      }
    ]);
  });

  it('should get all stories for authenticated user', async () => {
    const { token } = await createTestUser();

    const response = await request(app)
      .get('/api/stories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.stories).toHaveLength(3); // All stories visible to authenticated user
    expect(response.body.pagination).toBeDefined();
  });

  it('should get only public stories for unauthenticated user', async () => {
    const response = await request(app)
      .get('/api/stories')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.stories).toHaveLength(2); // Only public and anonymous stories
    expect(response.body.stories.every((story: any) => 
      story.privacy_level === 'public' || story.privacy_level === 'anonymous'
    )).toBe(true);
  });

  it('should filter stories by privacy level', async () => {
    const { token } = await createTestUser();

    const response = await request(app)
      .get('/api/stories?privacy_level=public')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.stories).toHaveLength(1);
    expect(response.body.stories[0].privacy_level).toBe('public');
  });

  it('should filter stories by tags', async () => {
    const response = await request(app)
      .get('/api/stories?tags=public')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.stories).toHaveLength(1);
    expect(response.body.stories[0].tags).toContain('public');
  });

  it('should search stories by text content', async () => {
    const response = await request(app)
      .get('/api/stories?search=anonymous')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.stories).toHaveLength(1);
    expect(response.body.stories[0].text_content).toContain('anonymous');
  });
});

describe('GET /api/stories/:id', () => {
  it('should get a specific story by ID', async () => {
    const { user } = await createTestUser();
    
    const story = await MeTooStory.create({
      user_id: user._id,
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'public',
      tags: ['test'],
      comment_enabled: true
    });

    const response = await request(app)
      .get(`/api/stories/${story._id}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.story).toBeDefined();
    expect(response.body.story.text_content).toBe(story.text_content);
  });

  it('should return 404 for non-existent story', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    
    await request(app)
      .get(`/api/stories/${fakeId}`)
      .expect(404);
  });

  it('should return 403 for restricted story without authentication', async () => {
    const { user } = await createTestUser();
    
    const story = await MeTooStory.create({
      user_id: user._id,
      text_content: 'This is a restricted story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'restricted',
      tags: ['test'],
      comment_enabled: true
    });

    await request(app)
      .get(`/api/stories/${story._id}`)
      .expect(403);
  });
});

describe('POST /api/stories/:id/comments', () => {
  it('should add a comment to a story', async () => {
    const { user, token } = await createTestUser();
    
    const story = await MeTooStory.create({
      user_id: user._id,
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'public',
      tags: ['test'],
      comment_enabled: true
    });

    const commentData = {
      text_content: 'This is a supportive comment.',
      is_anonymous: false
    };

    const response = await request(app)
      .post(`/api/stories/${story._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(commentData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Comment added successfully');
    expect(response.body.comment).toBeDefined();
    expect(response.body.comment.text_content).toBe(commentData.text_content);
    expect(response.body.comment.user_id).toBeDefined();
  });

  it('should add an anonymous comment', async () => {
    const { user, token } = await createTestUser();
    
    const story = await MeTooStory.create({
      user_id: user._id,
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'public',
      tags: ['test'],
      comment_enabled: true
    });

    const commentData = {
      text_content: 'This is an anonymous supportive comment.',
      is_anonymous: true
    };

    const response = await request(app)
      .post(`/api/stories/${story._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(commentData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.comment.user_id).toBeNull();
  });

  it('should return 403 when comments are disabled', async () => {
    const { user, token } = await createTestUser();
    
    const story = await MeTooStory.create({
      user_id: user._id,
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'public',
      tags: ['test'],
      comment_enabled: false
    });

    const commentData = {
      text_content: 'This is a supportive comment.',
      is_anonymous: false
    };

    await request(app)
      .post(`/api/stories/${story._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(commentData)
      .expect(403);
  });

  it('should return 400 for invalid comment data', async () => {
    const { user, token } = await createTestUser();
    
    const story = await MeTooStory.create({
      user_id: user._id,
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'public',
      tags: ['test'],
      comment_enabled: true
    });

    const invalidCommentData = {
      text_content: '', // Empty comment
      is_anonymous: 'invalid' // Invalid boolean
    };

    const response = await request(app)
      .post(`/api/stories/${story._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send(invalidCommentData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});

describe('GET /api/stories/:id/comments', () => {
  it('should get comments for a story', async () => {
    const { user } = await createTestUser();
    
    const story = await MeTooStory.create({
      user_id: user._id,
      text_content: 'This is a test story about my experience. It needs to be at least 10 characters long.',
      privacy_level: 'public',
      tags: ['test'],
      comment_enabled: true
    });

    // Add some comments
    await Comment.create([
      {
        story_id: story._id,
        user_id: user._id,
        text_content: 'First comment'
      },
      {
        story_id: story._id,
        user_id: null,
        text_content: 'Anonymous comment'
      }
    ]);

    const response = await request(app)
      .get(`/api/stories/${story._id}/comments`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.comments).toHaveLength(2);
  });

  it('should return 404 for non-existent story', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    
    await request(app)
      .get(`/api/stories/${fakeId}/comments`)
      .expect(404);
  });
});


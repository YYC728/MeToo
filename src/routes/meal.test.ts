import request from 'supertest';
import app from '../app';
import User from '../models/user.model';
import MealPost from '../models/meal.model';
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
  await MealPost.deleteMany({});
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

describe('POST /api/meals', () => {
  it('should create a meal post successfully', async () => {
    const { token } = await createTestUser();

    const mealData = {
      dish_name: 'Chicken Curry',
      dietary_group: ['halal', 'gluten-free'],
      portion_size: 2,
      location: {
        latitude: -33.8688,
        longitude: 151.2093
      },
      pickup_time_window: {
        start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        end: new Date(Date.now() + 4 * 60 * 60 * 1000)    // 4 hours from now
      },
      allergens: ['nuts'],
      additional_notes: 'Spicy curry with rice',
      availability_dates: [new Date(Date.now() + 24 * 60 * 60 * 1000)] // Tomorrow
    };

    const response = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(mealData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Meal post created successfully');
    expect(response.body.meal).toBeDefined();
    expect(response.body.meal.dish_name).toBe(mealData.dish_name);
    expect(response.body.meal.dietary_group).toEqual(mealData.dietary_group);
    expect(response.body.meal.portion_size).toBe(mealData.portion_size);
  });

  it('should return 401 for unauthenticated request', async () => {
    const mealData = {
      dish_name: 'Chicken Curry',
      dietary_group: ['halal'],
      portion_size: 2,
      location: {
        latitude: -33.8688,
        longitude: 151.2093
      },
      pickup_time_window: {
        start: new Date(Date.now() + 2 * 60 * 60 * 1000),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000)
      },
      availability_dates: [new Date(Date.now() + 24 * 60 * 60 * 1000)]
    };

    await request(app)
      .post('/api/meals')
      .send(mealData)
      .expect(401);
  });

  it('should return 400 for invalid data', async () => {
    const { token } = await createTestUser();

    const invalidMealData = {
      dish_name: '', // Empty dish name
      dietary_group: [], // Empty dietary group
      portion_size: 0, // Invalid portion size
      location: {
        latitude: 200, // Invalid latitude
        longitude: 200  // Invalid longitude
      },
      pickup_time_window: {
        start: new Date(Date.now() + 4 * 60 * 60 * 1000),
        end: new Date(Date.now() + 2 * 60 * 60 * 1000) // End before start
      },
      availability_dates: [] // Empty availability dates
    };

    const response = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidMealData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });
});

describe('GET /api/meals', () => {
  beforeEach(async () => {
    // Create test meals
    const { user } = await createTestUser();
    
    await MealPost.create([
      {
        user_id: user._id,
        dish_name: 'Vegan Pasta',
        dietary_group: ['vegan', 'gluten-free'],
        portion_size: 1,
        location: {
          type: 'Point',
          coordinates: [151.2093, -33.8688] // Sydney coordinates
        },
        pickup_time_window: {
          start: new Date(Date.now() + 2 * 60 * 60 * 1000),
          end: new Date(Date.now() + 4 * 60 * 60 * 1000)
        },
        availability_dates: [new Date(Date.now() + 24 * 60 * 60 * 1000)],
        is_available: true
      },
      {
        user_id: user._id,
        dish_name: 'Halal Chicken',
        dietary_group: ['halal'],
        portion_size: 2,
        location: {
          type: 'Point',
          coordinates: [151.2093, -33.8688]
        },
        pickup_time_window: {
          start: new Date(Date.now() + 2 * 60 * 60 * 1000),
          end: new Date(Date.now() + 4 * 60 * 60 * 1000)
        },
        availability_dates: [new Date(Date.now() + 24 * 60 * 60 * 1000)],
        is_available: true
      }
    ]);
  });

  it('should get all meals', async () => {
    const response = await request(app)
      .get('/api/meals')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meals).toHaveLength(2);
    expect(response.body.pagination).toBeDefined();
  });

  it('should filter meals by dietary group', async () => {
    const response = await request(app)
      .get('/api/meals?dietary_group=vegan')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meals).toHaveLength(1);
    expect(response.body.meals[0].dietary_group).toContain('vegan');
  });

  it('should filter meals by location radius', async () => {
    const response = await request(app)
      .get('/api/meals?lat=-33.8688&lon=151.2093&radius=1000')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meals).toHaveLength(2);
  });

  it('should filter meals by portion size', async () => {
    const response = await request(app)
      .get('/api/meals?min_portion_size=2')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meals).toHaveLength(1);
    expect(response.body.meals[0].portion_size).toBe(2);
  });

  it('should work without authentication', async () => {
    const response = await request(app)
      .get('/api/meals')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meals).toHaveLength(2);
  });
});

describe('GET /api/meals/:id', () => {
  it('should get a specific meal by ID', async () => {
    const { user } = await createTestUser();
    
    const meal = await MealPost.create({
      user_id: user._id,
      dish_name: 'Test Meal',
      dietary_group: ['vegan'],
      portion_size: 1,
      location: {
        type: 'Point',
        coordinates: [151.2093, -33.8688]
      },
      pickup_time_window: {
        start: new Date(Date.now() + 2 * 60 * 60 * 1000),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000)
      },
      availability_dates: [new Date(Date.now() + 24 * 60 * 60 * 1000)],
      is_available: true
    });

    const response = await request(app)
      .get(`/api/meals/${meal._id}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meal).toBeDefined();
    expect(response.body.meal.dish_name).toBe('Test Meal');
  });

  it('should return 404 for non-existent meal', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    
    await request(app)
      .get(`/api/meals/${fakeId}`)
      .expect(404);
  });
});

describe('PATCH /api/meals/:id/availability', () => {
  it('should update meal availability', async () => {
    const { user, token } = await createTestUser();
    
    const meal = await MealPost.create({
      user_id: user._id,
      dish_name: 'Test Meal',
      dietary_group: ['vegan'],
      portion_size: 1,
      location: {
        type: 'Point',
        coordinates: [151.2093, -33.8688]
      },
      pickup_time_window: {
        start: new Date(Date.now() + 2 * 60 * 60 * 1000),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000)
      },
      availability_dates: [new Date(Date.now() + 24 * 60 * 60 * 1000)],
      is_available: true
    });

    const response = await request(app)
      .patch(`/api/meals/${meal._id}/availability`)
      .set('Authorization', `Bearer ${token}`)
      .send({ is_available: false })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.meal.is_available).toBe(false);
  });

  it('should return 401 for unauthenticated request', async () => {
    const { user } = await createTestUser();
    
    const meal = await MealPost.create({
      user_id: user._id,
      dish_name: 'Test Meal',
      dietary_group: ['vegan'],
      portion_size: 1,
      location: {
        type: 'Point',
        coordinates: [151.2093, -33.8688]
      },
      pickup_time_window: {
        start: new Date(Date.now() + 2 * 60 * 60 * 1000),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000)
      },
      availability_dates: [new Date(Date.now() + 24 * 60 * 60 * 1000)],
      is_available: true
    });

    await request(app)
      .patch(`/api/meals/${meal._id}/availability`)
      .send({ is_available: false })
      .expect(401);
  });
});

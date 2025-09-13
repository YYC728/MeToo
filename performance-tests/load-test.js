import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '5m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate must be below 10%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
  { email: 'test4@example.com', password: 'password123' },
  { email: 'test5@example.com', password: 'password123' },
];

let authTokens = [];

export function setup() {
  // Pre-authenticate test users
  console.log('Setting up test users...');
  
  for (let user of testUsers) {
    // Register user
    const registerPayload = JSON.stringify({
      email: user.email,
      password: user.password,
      first_name: 'Test',
      last_name: 'User',
      university: 'Test University',
      dietary_restrictions: ['vegetarian'],
      location: {
        type: 'Point',
        coordinates: [151.2093, -33.8688] // Sydney coordinates
      }
    });

    const registerResponse = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (registerResponse.status === 201) {
      console.log(`Registered user: ${user.email}`);
    }

    // Login user
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password,
    });

    const loginResponse = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (loginResponse.status === 200) {
      const loginData = JSON.parse(loginResponse.body);
      authTokens.push(loginData.token);
      console.log(`Authenticated user: ${user.email}`);
    }
  }

  return { authTokens };
}

export default function(data) {
  const token = data.authTokens[Math.floor(Math.random() * data.authTokens.length)];
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test scenarios with different weights
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    // 30% - Browse meals
    testBrowseMeals(headers);
  } else if (scenario < 0.5) {
    // 20% - Browse stories
    testBrowseStories(headers);
  } else if (scenario < 0.7) {
    // 20% - Create meal post
    testCreateMealPost(headers);
  } else if (scenario < 0.85) {
    // 15% - Create story
    testCreateStory(headers);
  } else if (scenario < 0.95) {
    // 10% - Send message
    testSendMessage(headers);
  } else {
    // 5% - Update profile
    testUpdateProfile(headers);
  }

  sleep(1);
}

function testBrowseMeals(headers) {
  const response = http.get(`${BASE_URL}/api/meals`, { headers });
  
  check(response, {
    'browse meals status is 200': (r) => r.status === 200,
    'browse meals response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(response.status !== 200);
}

function testBrowseStories(headers) {
  const response = http.get(`${BASE_URL}/api/stories`, { headers });
  
  check(response, {
    'browse stories status is 200': (r) => r.status === 200,
    'browse stories response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(response.status !== 200);
}

function testCreateMealPost(headers) {
  const mealData = {
    dish_name: `Test Meal ${Date.now()}`,
    description: 'A test meal for performance testing',
    dietary_group: 'vegetarian',
    location: {
      type: 'Point',
      coordinates: [151.2093 + (Math.random() - 0.5) * 0.01, -33.8688 + (Math.random() - 0.5) * 0.01]
    },
    available_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    allergens: ['gluten'],
    spice_level: 'medium'
  };

  const response = http.post(`${BASE_URL}/api/meals`, JSON.stringify(mealData), { headers });
  
  check(response, {
    'create meal status is 201': (r) => r.status === 201,
    'create meal response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(response.status !== 201);
}

function testCreateStory(headers) {
  const storyData = {
    title: `Test Story ${Date.now()}`,
    content: 'This is a test story for performance testing purposes.',
    privacy_level: 'university',
    tags: ['test', 'performance'],
    is_anonymous: false
  };

  const response = http.post(`${BASE_URL}/api/stories`, JSON.stringify(storyData), { headers });
  
  check(response, {
    'create story status is 201': (r) => r.status === 201,
    'create story response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(response.status !== 201);
}

function testSendMessage(headers) {
  // Get a random user to send message to
  const usersResponse = http.get(`${BASE_URL}/api/users`, { headers });
  
  if (usersResponse.status === 200) {
    const users = JSON.parse(usersResponse.body);
    if (users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const messageData = {
        recipient_id: randomUser._id,
        content: `Test message ${Date.now()}`,
        message_type: 'text'
      };

      const response = http.post(`${BASE_URL}/api/messages`, JSON.stringify(messageData), { headers });
      
      check(response, {
        'send message status is 201': (r) => r.status === 201,
        'send message response time < 1s': (r) => r.timings.duration < 1000,
      });
      
      errorRate.add(response.status !== 201);
    }
  }
}

function testUpdateProfile(headers) {
  const profileData = {
    first_name: `TestUser${Date.now()}`,
    bio: 'Updated bio for performance testing',
    dietary_restrictions: ['vegetarian', 'gluten-free']
  };

  const response = http.put(`${BASE_URL}/api/users/profile`, JSON.stringify(profileData), { headers });
  
  check(response, {
    'update profile status is 200': (r) => r.status === 200,
    'update profile response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(response.status !== 200);
}

export function teardown(data) {
  console.log('Performance test completed');
  console.log(`Tested with ${data.authTokens.length} authenticated users`);
}

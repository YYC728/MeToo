# Project Todo List: University Meal Exchange & #MeToo Story Sharing App

This checklist breaks down the development process into manageable phases and tasks, following the test-driven development (TDD) approach outlined in the prompts.

## Phase 1: Backend - Core User Authentication and Profile Setup

### 1.1: Initial Project Setup (Prompt 1)
-   [ ] Initialize a new Node.js project.
-   [ ] Add TypeScript support and configure `tsconfig.json`.
-   [ ] Install Express.js and its TypeScript types.
-   [ ] Create the initial server entry point in **`src/server.ts`**.
-   [ ] Create the Express application setup in **`src/app.ts`**.
-   [ ] Implement a `GET /health` endpoint for basic health checks.
-   [ ] Set up the testing environment with Jest, Supertest, and their TypeScript configurations.
-   [ ] Write the first test in **`src/app.test.ts`** to verify the `GET /health` endpoint.

### 1.2: User Model and Database Connection (Prompt 2)
-   [ ] Install Mongoose and `dotenv`.
-   [ ] Create a **`.env`** file and add `MONGO_URI`.
-   [ ] Implement the database connection logic.
-   [ ] Define the `User` schema in **`src/models/user.model.ts`** with all specified fields (`stage_name`, `university_email`, `password`, etc.).
-   [ ] Add a unique index to the `university_email` field.
-   [ ] Install `bcrypt` for password hashing.
-   [ ] Implement a `pre-save` hook in the User schema to automatically hash passwords.
-   [ ] Write a unit test in **`src/models/user.model.test.ts`** to confirm the password hashing works as expected.

### 1.3: User Registration Endpoint (Prompt 3)
-   [ ] Create the test file **`src/routes/auth.test.ts`**.
-   [ ] Write a test for successful user registration (`201 Created`).
-   [ ] Write a test for registration with an existing email (`409 Conflict`).
-   [ ] Write a test for registration with missing required fields (`400 Bad Request`).
-   [ ] Write a test for registration with an invalid email format (`400 Bad Request`).
-   [ ] Create **`src/routes/auth.routes.ts`** and define the `POST /api/auth/register` route.
-   [ ] Create **`src/controllers/auth.controller.ts`** and implement the registration logic.
-   [ ] Add input validation (e.g., using a library like `express-validator` or `zod`).
-   [ ] Ensure all registration tests pass.

### 1.4: Email Verification Logic (Prompt 4)
-   [ ] Define a new `EmailVerificationToken` Mongoose schema.
-   [ ] Implement a service to generate a unique token and save it, linked to a user.
-   [ ] Create a (mocked) email sending service to send the verification link.
-   [ ] Write tests for the `GET /api/auth/verify-email/:token` endpoint.
    -   [ ] Test successful verification with a valid token.
    -   [ ] Test verification failure with an invalid or expired token.
-   [ ] Implement the controller logic for the email verification endpoint.
-   [ ] Update the registration controller to call the email verification service after a new user is created.
-   [ ] Run tests to ensure the entire flow works.

### 1.5: User Login and JWT Authentication (Prompt 5)
-   [ ] Install `jsonwebtoken` and its types.
-   [ ] Write tests for the `POST /api/auth/login` endpoint.
    -   [ ] Test successful login for a verified user (returns JWT).
    -   [ ] Test login failure with incorrect credentials (`401 Unauthorized`).
    -   [ ] Test login failure for an unverified user (`403 Forbidden`).
-   [ ] Implement the login controller logic, including password comparison and JWT generation.
-   [ ] Create authentication middleware in **`src/middleware/auth.middleware.ts`**.
-   [ ] The middleware should verify the JWT and attach the user to the `request` object.
-   [ ] Write a separate unit test to validate the authentication middleware.

## Phase 2: Backend - Meal Exchange Feature

### 2.1: Meal Post Model and Creation (Prompt 6)
-   [ ] Define the `MealPost` schema in **`src/models/meal.model.ts`** with all specified fields.
-   [ ] Use the GeoJSON Point type for the `location` field.
-   [ ] Write tests for the `POST /api/meals` endpoint.
    -   [ ] Test successful meal creation by an authenticated user.
    -   [ ] Test creation failure for an unauthenticated user (`401 Unauthorized`).
    -   [ ] Test creation failure with invalid data (e.g., past date, bad coordinates) (`400 Bad Request`).
-   [ ] Implement the route and controller for creating meal posts.
-   [ ] Protect the route using the authentication middleware created in Phase 1.

### 2.2: Meal Discovery and Filtering (Prompt 7)
-   [ ] Add a `2dsphere` index to the `location` field in the `MealPost` schema for geospatial queries.
-   [ ] Write tests for the `GET /api/meals` endpoint.
    -   [ ] Test retrieving all available meals.
    -   [ ] Test filtering by `dietary_group`.
    -   [ ] Test filtering by location radius (geospatial query).
    -   [ ] Test filtering by `pickup_time_window`.
    -   [ ] Test combining multiple filters in one request.
-   [ ] Implement the controller logic for meal discovery, handling all filter combinations gracefully.

## Phase 3: Backend - #MeToo Story Sharing Feature

### 3.1: Story/Comment Models & Posting (Prompt 8)
-   [ ] Define the `MeTooStory` schema in **`src/models/story.model.ts`**.
-   [ ] Define the `Comment` schema in **`src/models/comment.model.ts`**.
-   [ ] Ensure `user_id` is nullable in both schemas to support anonymity.
-   [ ] Write tests for the protected `POST /api/stories` endpoint.
    -   [ ] Test successful story creation by an authenticated user.
    -   [ ] Test that setting `privacy_level` to 'anonymous' results in a `null` `user_id`.
    -   [ ] Test for request validation failures (`400 Bad Request`).
-   [ ] Implement the route and controller for posting stories, ensuring the anonymity logic is correctly applied.

### 3.2: Story Viewing and Commenting (Prompt 9)
-   [ ] Write tests for the `GET /api/stories/:storyId` endpoint.
    -   [ ] Test visibility rules for `public` vs. `restricted` stories.
-   [ ] Write tests for the `POST /api/stories/:storyId/comments` endpoint.
    -   [ ] Test successful comment creation by an authenticated user.
    -   [ ] Test that a user can post a comment anonymously.
    -   [ ] Test failure when commenting is disabled on a story (`403 Forbidden`).
-   [ ] Implement the controller logic for viewing a single story.
-   [ ] Implement the controller logic for adding a comment to a story.
-   [ ] Implement a separate `GET /api/stories/:storyId/comments` endpoint to retrieve comments, ensuring visibility rules (poster/commenters only) are enforced.

## Phase 4: Backend - Messaging, Safety, and Final Integration

### 4.1: Real-Time Messaging with Socket.IO (Prompt 10)
-   [ ] Install `socket.io`.
-   [ ] Integrate `socket.io` with the existing Express server.
-   [ ] Implement JWT-based authentication for socket connections.
-   [ ] Implement logic for users to join a personal room based on their `user_id`.
-   [ ] Create event handlers for `sendMessage` and `newMessage`.
-   [ ] Write integration tests for the socket logic using `socket.io-client`.
    -   [ ] Test successful connection with a valid JWT.
    -   [ ] Test connection rejection with an invalid JWT.
    -   [ ] Test that a message sent to a specific user is only received by that user.

### 4.2: User Blocking and Content Moderation (Prompt 11)
-   [ ] Write tests for the `POST /api/users/block/:userIdToBlock` endpoint.
    -   [ ] Test successful blocking of another user.
    -   [ ] Test that the blocked user's ID is correctly added to the `blocked_users` array.
    -   [ ] Test that a user cannot block themselves.
-   [ ] Implement the controller logic for the user blocking endpoint.
-   [ ] Update the messaging logic to prevent messages between blocked users.
-   [ ] Update all content retrieval endpoints (`GET /api/meals`, `GET /api/stories`, etc.) to filter out content from/to blocked users.
-   [ ] Add tests to the existing test suites for messaging and content retrieval to verify the blocking logic works correctly.

## Phase 5: Frontend Development (High-Level)

-   [ ] Choose a frontend framework (e.g., React Native, Flutter, React, Vue).
-   [ ] Set up the frontend project structure.
-   [ ] **User Authentication UI**
    -   [ ] Create Registration, Login, and "Verify Email" pages.
    -   [ ] Implement state management for user authentication (e.g., Context API, Redux).
-   [ ] **Meal Exchange UI**
    -   [ ] Integrate a map library (e.g., Mapbox, Google Maps).
    -   [ ] Implement UI for displaying meal posts as map markers.
    -   [ ] Create the "Post a Meal" form.
    -   [ ] Build the search and filtering interface.
-   [ ] **#MeToo Story Sharing UI**
    -   [ ] Create the "Share a Story" form with media upload capability.
    -   [ ] Build the story feed/discovery page.
    -   [ ] Create the story detail view with the anonymous comment thread.
-   [ ] **Cross-Feature UI**
    -   [ ] Implement the real-time messaging interface.
    -   [ ] Create the user profile and settings page (privacy, notifications).
    -   [ ] Implement UI for blocking users.

## Phase 6: Testing, Deployment & Maintenance

### 6.1: Comprehensive Testing
-   [ ] **Unit Testing:** Review all backend logic for sufficient test coverage.
-   [ ] **Integration Testing:** Write end-to-end tests for critical user flows (e.g., register -> post meal -> another user finds it).
-   [ ] **User Acceptance Testing (UAT):** Manually test all features against the specification document.
-   [ ] **Security Testing:** Perform basic penetration testing, especially on authentication and media upload endpoints.

### 6.2: Deployment
-   [ ] Set up a CI/CD pipeline (e.g., using GitHub Actions).
-   [ ] Provision a cloud environment (e.g., AWS, Google Cloud, Heroku).
-   [ ] Set up a production database and cloud storage for media (e.g., S3).
-   [ ] Configure environment variables for production.
-   [ ] Deploy the application.

### 6.3: Maintenance
-   [ ] Set up application monitoring and error logging (e.g., Sentry, Datadog).
-   [ ] Configure regular database backups.
-   [ ] Plan for ongoing maintenance and future feature updates.

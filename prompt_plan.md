Initialize a new Node.js project with TypeScript. Set up an Express server in `src/server.ts`. Configure the project to use Jest and Supertest for testing.

Create a basic Express app instance in `src/app.ts` that includes a simple health check route at `GET /health` which returns a 200 OK status with a JSON body `{ status: 'ok' }`.

Write a test file `src/app.test.ts` using Jest and Supertest to verify that the `GET /health` endpoint works as expected.

Building on the previous step, integrate Mongoose to connect to a MongoDB database. Create a file for environment variables (`.env`) to store the database connection string.

Define the `User` data model in `src/models/user.model.ts` according to the specification. It must include:
- `stage_name` (String, required)
- `university_email` (String, required, unique)
- `password` (String, required)
- `is_email_verified` (Boolean, default: false)
- `disclosure_preferences` (Object with `university_visibility`: Boolean, default: false)
- `blocked_users` (Array of User ObjectIds)

Also, add a pre-save hook to the Mongoose schema to automatically hash the user's password using `bcrypt` before it's saved to the database. Write a unit test in `src/models/user.model.test.ts` to ensure the password hashing pre-save hook works correctly.

Create a new test file `src/routes/auth.test.ts`. Write a test suite for a new user registration endpoint `POST /api/auth/register`. The tests should cover the following scenarios:
1.  A successful registration with valid data should return a 201 status code and the created user object (without the password).
2.  An attempt to register with a `university_email` that already exists should return a 409 (Conflict) status code.
3.  A request missing required fields (`stage_name`, `university_email`, `password`) should return a 400 (Bad Request) status code.
4.  An attempt to register with an invalid email format should return a 400 status code.

Now, create the registration route and controller logic in `src/routes/auth.routes.ts` and `src/controllers/auth.controller.ts` respectively, to make all the tests pass. Ensure you validate the incoming data.

We need to verify user emails. Implement a system that generates a unique, single-use verification token (e.g., using `crypto`) and saves it to a new `EmailVerificationToken` model linked to the user.

Create a service that sends an email (you can mock the email sending part for now) to the user with a verification link containing this token.

Now, create a new endpoint `GET /api/auth/verify-email/:token`. Write tests for this endpoint first:
1. A valid token should find the associated user, set `is_email_verified` to `true`, delete the token, and return a 200 success message.
2. An invalid or expired token should return a 400 error.

Finally, implement the controller logic to make the tests pass. Modify the registration controller from the previous step to trigger the email verification process upon successful registration.

First, write tests for a login endpoint `POST /api/auth/login`. The tests should verify that:
1.  A login attempt with correct credentials for a verified user returns a 200 status and a JSON Web Token (JWT).
2.  A login attempt with incorrect credentials returns a 401 (Unauthorized) status code.
3.  A login attempt for a user whose email has not yet been verified should return a 403 (Forbidden) status code.

Next, implement the login controller logic to make the tests pass. Use the `jsonwebtoken` library to generate a token containing the `user_id`.

Finally, create an authentication middleware function in `src/middleware/auth.middleware.ts`. This middleware should verify the JWT from the `Authorization` header. If valid, it should attach the user's information to the request object. Write a separate test for this middleware.

Define the `MealPost` data model in `src/models/meal.model.ts` based on the specification. Include fields for `dish_name`, `dietary_group`, `portion_size`, `location` (using GeoJSON Point format), `pickup_time_window`, `allergens`, `user_id`, and `availability_dates`.

Next, write tests for a new protected endpoint `POST /api/meals`. The tests must ensure that:
1. An authenticated user can successfully create a meal post with valid data, returning a 201 status.
2. An unauthenticated user receives a 401 error.
3. A request with missing or invalid data (e.g., availability date in the past, invalid coordinates) returns a 400 error.

Now, implement the route and controller for `POST /api/meals`. Use the authentication middleware created in the previous phase to protect this route.

Write tests for the meal discovery endpoint `GET /api/meals`. The tests should cover:
1. Successfully retrieving a list of all available meals.
2. Filtering meals by `dietary_group`.
3. Filtering meals within a specific location radius (geospatial query). You can use a query parameter like `?lat=...&lon=...&radius=...`.
4. Filtering meals available within a specific time window.
5. Combining multiple filters in a single request.

After writing the tests, implement the controller logic for `GET /api/meals` to support these filtering capabilities. Ensure the endpoint can handle requests with no filters, one filter, or multiple combined filters. For geospatial queries, create a 2dsphere index on the `location` field in your `MealPost` model.

Define two new Mongoose models: `MeTooStory` and `Comment` in `src/models/story.model.ts` and `src/models/comment.model.ts`.
- `MeTooStory` should include `user_id` (nullable for anonymous posts), `text_content`, `media_attachments`, `privacy_level` (enum: 'public', 'restricted', 'anonymous'), `tags`, and `comment_enabled`.
- `Comment` should include `story_id`, `user_id` (nullable for anonymous comments), `text_content`, and a timestamp.

Write tests for a new protected endpoint `POST /api/stories`. The tests should validate:
1. An authenticated user can post a story.
2. If `privacy_level` is 'anonymous', the `user_id` field on the saved story document should be `null`.
3. A request with invalid data (e.g., an invalid `privacy_level`) should be rejected with a 400 error.

Finally, implement the route and controller to allow authenticated users to post stories, ensuring the anonymity logic is correctly handled.

Now, let's build the interaction logic. First, create a test suite for `GET /api/stories/:storyId`. It should test:
1.  A `restricted` story is only visible to authenticated users.
2.  A `public` story is visible to anyone.
3.  The correct story data is returned.

Next, write tests for a new protected endpoint `POST /api/stories/:storyId/comments`. The tests should check:
1.  An authenticated user can post a comment on a story where comments are enabled.
2.  An attempt to comment on a story where `comment_enabled` is `false` results in a 403 error.
3.  The comment can also be anonymous, leaving the `user_id` on the comment as `null`.

Finally, implement the controller logic for both endpoints. For the commenting endpoint, ensure that the logic for anonymous commenting is handled correctly. The logic for retrieving comments should ensure that only the original poster and other commenters can see the full thread (this logic can be implemented in a subsequent `GET /api/stories/:storyId/comments` endpoint).

Integrate `socket.io` into the Express server for real-time messaging. Create a new service in `src/services/socket.service.ts` to manage socket connections.

Implement authentication for socket connections using the JWT from the user's client. A user should only be able to connect if they provide a valid token.

Create socket event listeners for:
- `sendMessage`: This event should receive a message payload containing `receiver_id` and `content`. The server should then emit a `newMessage` event only to the specified `receiver_id`.
- `joinRoom`: A user should join a room named after their `user_id` upon connection to easily receive targeted messages.

Write tests for the messaging logic. You can use `socket.io-client` in your Jest tests to simulate client connections and message events, verifying that messages are routed correctly and only to the intended recipient.

Implement the user blocking feature. Create a new protected endpoint `POST /api/users/block/:userIdToBlock`.
- First, write tests to ensure:
  1. An authenticated user can successfully block another user.
  2. The blocked user's ID is added to the `blocked_users` array in the blocker's user document.
  3. A user cannot block themselves.

- Then, implement the controller logic.

Now, update the messaging logic (`sendMessage` socket event) and any content-retrieval endpoints (e.g., `GET /api/meals`, `GET /api/stories`) to ensure that:
1. A blocked user cannot send a message to the user who blocked them.
2. Content created by a user you have blocked does not appear in your results.
3. Content created by a user who has blocked you does not appear in your results.

Update your existing test suites for messaging and content retrieval to include test cases for this blocking logic.

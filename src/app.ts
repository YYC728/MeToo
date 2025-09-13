import express from 'express';
import path from 'path';
import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import mealRoutes from './routes/meal.routes';
import storyRoutes from './routes/story.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;

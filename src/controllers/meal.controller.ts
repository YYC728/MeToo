import { Response } from 'express';
import MealPost, { IMealPost } from '../models/meal.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { validationResult } from 'express-validator';

/**
 * Create a new meal post
 * POST /api/meals
 */
export const createMealPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const {
      dish_name,
      dietary_group,
      portion_size,
      location,
      pickup_time_window,
      allergens,
      additional_notes,
      availability_dates
    } = req.body;

    // Validate pickup time window
    const startTime = new Date(pickup_time_window.start);
    const endTime = new Date(pickup_time_window.end);
    
    if (startTime >= endTime) {
      res.status(400).json({
        success: false,
        message: 'Pickup end time must be after start time'
      });
      return;
    }

    // Validate availability dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);

    for (const date of availability_dates) {
      const availabilityDate = new Date(date);
      if (availabilityDate < today || availabilityDate > maxDate) {
        res.status(400).json({
          success: false,
          message: 'Availability dates must be between today and 7 days from now'
        });
        return;
      }
    }

    // Create meal post
    const mealPost = new MealPost({
      user_id: req.user._id,
      dish_name,
      dietary_group,
      portion_size,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      pickup_time_window: {
        start: startTime,
        end: endTime
      },
      allergens: allergens || [],
      additional_notes,
      availability_dates: availability_dates.map((date: string) => new Date(date))
    });

    await mealPost.save();

    res.status(201).json({
      success: true,
      message: 'Meal post created successfully',
      meal: mealPost
    });
  } catch (error) {
    console.error('Create meal post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get meals with filtering options
 * GET /api/meals
 */
export const getMeals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      dietary_group,
      lat,
      lon,
      radius = 5000, // 5km default radius
      start_date,
      end_date,
      min_portion_size,
      max_portion_size,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query: any = { is_available: true };

    // Filter by dietary group
    if (dietary_group) {
      const groups = Array.isArray(dietary_group) ? dietary_group : [dietary_group];
      query.dietary_group = { $in: groups };
    }

    // Filter by portion size
    if (min_portion_size || max_portion_size) {
      query.portion_size = {};
      if (min_portion_size) query.portion_size.$gte = parseInt(min_portion_size as string);
      if (max_portion_size) query.portion_size.$lte = parseInt(max_portion_size as string);
    }

    // Filter by availability dates
    if (start_date || end_date) {
      query.availability_dates = {};
      if (start_date) {
        query.availability_dates.$gte = new Date(start_date as string);
      }
      if (end_date) {
        query.availability_dates.$lte = new Date(end_date as string);
      }
    }

    // Geospatial query
    let meals;
    if (lat && lon) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const radiusInMeters = parseInt(radius as string);

      meals = await MealPost.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusInMeters
          }
        }
      })
      .populate('user_id', 'stage_name disclosure_preferences')
      .sort({ created_at: -1 })
      .limit(parseInt(limit as string) * parseInt(page as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));
    } else {
      meals = await MealPost.find(query)
        .populate('user_id', 'stage_name disclosure_preferences')
        .sort({ created_at: -1 })
        .limit(parseInt(limit as string) * parseInt(page as string))
        .skip((parseInt(page as string) - 1) * parseInt(limit as string));
    }

    // Filter out meals from blocked users if user is authenticated
    let filteredMeals = meals;
    if (req.user) {
      filteredMeals = meals.filter(meal => {
        const mealUser = meal.user_id as any;
        return !req.user.blocked_users.includes(mealUser._id) &&
               !mealUser.blocked_users.includes(req.user._id);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meals retrieved successfully',
      meals: filteredMeals,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredMeals.length
      }
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get a single meal by ID
 * GET /api/meals/:id
 */
export const getMealById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const meal = await MealPost.findById(id)
      .populate('user_id', 'stage_name disclosure_preferences');

    if (!meal) {
      res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
      return;
    }

    // Check if user is blocked
    if (req.user) {
      const mealUser = meal.user_id as any;
      if (req.user.blocked_users.includes(mealUser._id) ||
          mealUser.blocked_users.includes(req.user._id)) {
        res.status(404).json({
          success: false,
          message: 'Meal not found'
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Meal retrieved successfully',
      meal
    });
  } catch (error) {
    console.error('Get meal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update meal availability
 * PATCH /api/meals/:id/availability
 */
export const updateMealAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const meal = await MealPost.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      { is_available },
      { new: true }
    );

    if (!meal) {
      res.status(404).json({
        success: false,
        message: 'Meal not found or you are not authorized to update it'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Meal availability updated successfully',
      meal
    });
  } catch (error) {
    console.error('Update meal availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


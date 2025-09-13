import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { createMealPost, getMeals, getMealById, updateMealAvailability } from '../controllers/meal.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Validation rules for creating meal posts
const createMealValidation = [
  body('dish_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Dish name must be between 2 and 100 characters'),
  body('dietary_group')
    .isArray({ min: 1 })
    .withMessage('At least one dietary group is required'),
  body('dietary_group.*')
    .isIn(['vegan', 'vegetarian', 'halal', 'kosher', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo', 'low-carb', 'other'])
    .withMessage('Invalid dietary group'),
  body('portion_size')
    .isInt({ min: 1, max: 20 })
    .withMessage('Portion size must be between 1 and 20'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('pickup_time_window.start')
    .isISO8601()
    .withMessage('Pickup start time must be a valid date'),
  body('pickup_time_window.end')
    .isISO8601()
    .withMessage('Pickup end time must be a valid date'),
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  body('allergens.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Allergen name cannot exceed 50 characters'),
  body('additional_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional notes cannot exceed 500 characters'),
  body('availability_dates')
    .isArray({ min: 1 })
    .withMessage('At least one availability date is required'),
  body('availability_dates.*')
    .isISO8601()
    .withMessage('Availability date must be a valid date')
];

// Validation rules for query parameters
const getMealsValidation = [
  query('dietary_group')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const validGroups = ['vegan', 'vegetarian', 'halal', 'kosher', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo', 'low-carb', 'other'];
        return validGroups.includes(value);
      }
      return true;
    })
    .withMessage('Invalid dietary group'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lon')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('min_portion_size')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum portion size must be at least 1'),
  query('max_portion_size')
    .optional()
    .isInt({ max: 20 })
    .withMessage('Maximum portion size cannot exceed 20'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Validation rules for meal ID parameter
const mealIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid meal ID')
];

// Routes
router.post('/', authenticate, createMealValidation, createMealPost);
router.get('/', optionalAuth, getMealsValidation, getMeals);
router.get('/:id', optionalAuth, mealIdValidation, getMealById);
router.patch('/:id/availability', authenticate, mealIdValidation, updateMealAvailability);

export default router;

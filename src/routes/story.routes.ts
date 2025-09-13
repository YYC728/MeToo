import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { createStory, getStoryById, getStories, addComment, getStoryComments } from '../controllers/story.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Validation rules for creating stories
const createStoryValidation = [
  body('text_content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Story must be between 10 and 5000 characters'),
  body('media_attachments')
    .optional()
    .isArray()
    .withMessage('Media attachments must be an array'),
  body('media_attachments.*')
    .optional()
    .isURL()
    .withMessage('Invalid media URL'),
  body('privacy_level')
    .isIn(['public', 'restricted', 'anonymous'])
    .withMessage('Privacy level must be public, restricted, or anonymous'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Tag cannot exceed 30 characters'),
  body('comment_enabled')
    .optional()
    .isBoolean()
    .withMessage('Comment enabled must be a boolean')
];

// Validation rules for adding comments
const addCommentValidation = [
  body('text_content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('Is anonymous must be a boolean')
];

// Validation rules for query parameters
const getStoriesValidation = [
  query('privacy_level')
    .optional()
    .isIn(['public', 'restricted', 'anonymous'])
    .withMessage('Invalid privacy level'),
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return true; // Single tag
      }
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string');
      }
      return true;
    })
    .withMessage('Invalid tags format'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
];

// Validation rules for story ID parameter
const storyIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid story ID')
];

// Routes
router.post('/', authenticate, createStoryValidation, createStory);
router.get('/', optionalAuth, getStoriesValidation, getStories);
router.get('/:id', optionalAuth, storyIdValidation, getStoryById);
router.post('/:id/comments', optionalAuth, storyIdValidation, addCommentValidation, addComment);
router.get('/:id/comments', optionalAuth, storyIdValidation, getStoryComments);

export default router;

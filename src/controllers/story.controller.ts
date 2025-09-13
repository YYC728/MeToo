import { Response } from 'express';
import MeTooStory, { IMeTooStory } from '../models/story.model';
import Comment from '../models/comment.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { validationResult } from 'express-validator';

/**
 * Create a new story
 * POST /api/stories
 */
export const createStory = async (req: AuthRequest, res: Response): Promise<void> => {
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
      text_content,
      media_attachments = [],
      privacy_level,
      tags = [],
      comment_enabled = true
    } = req.body;

    // Create story
    const story = new MeTooStory({
      user_id: privacy_level === 'anonymous' ? null : req.user._id,
      text_content,
      media_attachments,
      privacy_level,
      tags,
      comment_enabled
    });

    await story.save();

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get a single story by ID
 * GET /api/stories/:id
 */
export const getStoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const story = await MeTooStory.findById(id);

    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Story not found'
      });
      return;
    }

    // Check privacy level
    if (story.privacy_level === 'restricted' && !req.user) {
      res.status(403).json({
        success: false,
        message: 'Access denied. This story is restricted to authenticated users.'
      });
      return;
    }

    // Check if user is blocked (if story has a user_id)
    if (story.user_id && req.user) {
      const storyUser = await story.populate('user_id', 'blocked_users');
      const storyUserId = (storyUser.user_id as any)?._id;
      
      if (storyUserId && 
          (req.user.blocked_users.includes(storyUserId) || 
           (storyUser.user_id as any).blocked_users.includes(req.user._id))) {
        res.status(404).json({
          success: false,
          message: 'Story not found'
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Story retrieved successfully',
      story
    });
  } catch (error) {
    console.error('Get story by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all stories with filtering
 * GET /api/stories
 */
export const getStories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      privacy_level,
      tags,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build query
    const query: any = {};

    // Filter by privacy level
    if (privacy_level) {
      if (privacy_level === 'public') {
        query.privacy_level = 'public';
      } else if (privacy_level === 'restricted' && req.user) {
        query.privacy_level = 'restricted';
      } else if (privacy_level === 'anonymous') {
        query.privacy_level = 'anonymous';
      }
    } else {
      // Default: show public and restricted (if authenticated)
      if (req.user) {
        query.privacy_level = { $in: ['public', 'restricted'] };
      } else {
        query.privacy_level = 'public';
      }
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Search in text content
    if (search) {
      query.text_content = { $regex: search, $options: 'i' };
    }

    const stories = await MeTooStory.find(query)
      .populate('user_id', 'stage_name disclosure_preferences')
      .sort({ created_at: -1 })
      .limit(parseInt(limit as string) * parseInt(page as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    // Filter out stories from blocked users if user is authenticated
    let filteredStories = stories;
    if (req.user) {
      filteredStories = stories.filter(story => {
        if (!story.user_id) return true; // Anonymous stories are always visible
        
        const storyUser = story.user_id as any;
        return !req.user.blocked_users.includes(storyUser._id) &&
               !storyUser.blocked_users.includes(req.user._id);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stories retrieved successfully',
      stories: filteredStories,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredStories.length
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Add a comment to a story
 * POST /api/stories/:id/comments
 */
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { id } = req.params;
    const { text_content, is_anonymous = false } = req.body;

    // Find the story
    const story = await MeTooStory.findById(id);

    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Story not found'
      });
      return;
    }

    // Check if comments are enabled
    if (!story.comment_enabled) {
      res.status(403).json({
        success: false,
        message: 'Comments are disabled for this story'
      });
      return;
    }

    // Check privacy level
    if (story.privacy_level === 'restricted' && !req.user) {
      res.status(403).json({
        success: false,
        message: 'Access denied. This story is restricted to authenticated users.'
      });
      return;
    }

    // Create comment
    const comment = new Comment({
      story_id: story._id,
      user_id: is_anonymous ? null : req.user?._id,
      text_content
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get comments for a story
 * GET /api/stories/:id/comments
 */
export const getStoryComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the story
    const story = await MeTooStory.findById(id);

    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Story not found'
      });
      return;
    }

    // Check privacy level
    if (story.privacy_level === 'restricted' && !req.user) {
      res.status(403).json({
        success: false,
        message: 'Access denied. This story is restricted to authenticated users.'
      });
      return;
    }

    // Get comments
    const comments = await Comment.find({ story_id: id })
      .populate('user_id', 'stage_name')
      .sort({ created_at: 1 });

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      comments
    });
  } catch (error) {
    console.error('Get story comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

import mongoose, { Document, Schema } from 'mongoose';

// Analytics Models
export interface IUserAnalytics extends Document {
  user_id: mongoose.Types.ObjectId;
  date: Date;
  login_count: number;
  meal_posts_created: number;
  stories_created: number;
  comments_made: number;
  messages_sent: number;
  time_spent_minutes: number;
  features_used: string[];
  created_at: Date;
}

export interface IAppAnalytics extends Document {
  date: Date;
  total_users: number;
  active_users: number;
  new_registrations: number;
  total_meals: number;
  total_stories: number;
  total_messages: number;
  total_comments: number;
  average_session_duration: number;
  most_used_features: string[];
  created_at: Date;
}

export interface IMealAnalytics extends Document {
  meal_id: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  shares: number;
  messages_sent: number;
  dietary_group: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  created_at: Date;
  updated_at: Date;
}

export interface IStoryAnalytics extends Document {
  story_id: mongoose.Types.ObjectId;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  privacy_level: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

// Schemas
const userAnalyticsSchema = new Schema<IUserAnalytics>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  login_count: {
    type: Number,
    default: 0
  },
  meal_posts_created: {
    type: Number,
    default: 0
  },
  stories_created: {
    type: Number,
    default: 0
  },
  comments_made: {
    type: Number,
    default: 0
  },
  messages_sent: {
    type: Number,
    default: 0
  },
  time_spent_minutes: {
    type: Number,
    default: 0
  },
  features_used: [{
    type: String
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

const appAnalyticsSchema = new Schema<IAppAnalytics>({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  total_users: {
    type: Number,
    default: 0
  },
  active_users: {
    type: Number,
    default: 0
  },
  new_registrations: {
    type: Number,
    default: 0
  },
  total_meals: {
    type: Number,
    default: 0
  },
  total_stories: {
    type: Number,
    default: 0
  },
  total_messages: {
    type: Number,
    default: 0
  },
  total_comments: {
    type: Number,
    default: 0
  },
  average_session_duration: {
    type: Number,
    default: 0
  },
  most_used_features: [{
    type: String
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

const mealAnalyticsSchema = new Schema<IMealAnalytics>({
  meal_id: {
    type: Schema.Types.ObjectId,
    ref: 'MealPost',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  messages_sent: {
    type: Number,
    default: 0
  },
  dietary_group: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const storyAnalyticsSchema = new Schema<IStoryAnalytics>({
  story_id: {
    type: Schema.Types.ObjectId,
    ref: 'MeTooStory',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  privacy_level: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create models
export const UserAnalytics = mongoose.model<IUserAnalytics>('UserAnalytics', userAnalyticsSchema);
export const AppAnalytics = mongoose.model<IAppAnalytics>('AppAnalytics', appAnalyticsSchema);
export const MealAnalytics = mongoose.model<IMealAnalytics>('MealAnalytics', mealAnalyticsSchema);
export const StoryAnalytics = mongoose.model<IStoryAnalytics>('StoryAnalytics', storyAnalyticsSchema);

// Analytics Service Class
export class AnalyticsService {
  /**
   * Track user activity
   */
  async trackUserActivity(userId: string, activity: string, metadata?: any): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updateData: any = {
        $inc: {}
      };

      switch (activity) {
        case 'login':
          updateData.$inc.login_count = 1;
          break;
        case 'meal_post_created':
          updateData.$inc.meal_posts_created = 1;
          break;
        case 'story_created':
          updateData.$inc.stories_created = 1;
          break;
        case 'comment_made':
          updateData.$inc.comments_made = 1;
          break;
        case 'message_sent':
          updateData.$inc.messages_sent = 1;
          break;
        case 'time_spent':
          updateData.$inc.time_spent_minutes = metadata?.minutes || 1;
          break;
      }

      if (activity !== 'time_spent') {
        updateData.$addToSet = { features_used: activity };
      }

      await UserAnalytics.findOneAndUpdate(
        { user_id: userId, date: today },
        updateData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  /**
   * Track meal interaction
   */
  async trackMealInteraction(mealId: string, interaction: string, metadata?: any): Promise<void> {
    try {
      const updateData: any = {
        $inc: {}
      };

      switch (interaction) {
        case 'view':
          updateData.$inc.views = 1;
          break;
        case 'like':
          updateData.$inc.likes = 1;
          break;
        case 'share':
          updateData.$inc.shares = 1;
          break;
        case 'message_sent':
          updateData.$inc.messages_sent = 1;
          break;
      }

      await MealAnalytics.findOneAndUpdate(
        { meal_id: mealId },
        updateData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error tracking meal interaction:', error);
    }
  }

  /**
   * Track story interaction
   */
  async trackStoryInteraction(storyId: string, interaction: string, metadata?: any): Promise<void> {
    try {
      const updateData: any = {
        $inc: {}
      };

      switch (interaction) {
        case 'view':
          updateData.$inc.views = 1;
          break;
        case 'like':
          updateData.$inc.likes = 1;
          break;
        case 'share':
          updateData.$inc.shares = 1;
          break;
        case 'comment':
          updateData.$inc.comments = 1;
          break;
      }

      await StoryAnalytics.findOneAndUpdate(
        { story_id: storyId },
        updateData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error tracking story interaction:', error);
    }
  }

  /**
   * Generate daily app analytics
   */
  async generateDailyAnalytics(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get user counts
      const totalUsers = await mongoose.model('User').countDocuments();
      const activeUsers = await UserAnalytics.distinct('user_id', {
        date: { $gte: today }
      }).then(users => users.length);

      const newRegistrations = await mongoose.model('User').countDocuments({
        created_at: { $gte: today }
      });

      // Get content counts
      const totalMeals = await mongoose.model('MealPost').countDocuments();
      const totalStories = await mongoose.model('MeTooStory').countDocuments();
      const totalMessages = await mongoose.model('Message').countDocuments();
      const totalComments = await mongoose.model('Comment').countDocuments();

      // Calculate average session duration
      const userAnalytics = await UserAnalytics.find({ date: today });
      const avgSessionDuration = userAnalytics.length > 0 
        ? userAnalytics.reduce((sum, ua) => sum + ua.time_spent_minutes, 0) / userAnalytics.length
        : 0;

      // Get most used features
      const featureCounts: { [key: string]: number } = {};
      userAnalytics.forEach(ua => {
        ua.features_used.forEach(feature => {
          featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
      });

      const mostUsedFeatures = Object.entries(featureCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([feature]) => feature);

      // Save analytics
      await AppAnalytics.findOneAndUpdate(
        { date: today },
        {
          total_users: totalUsers,
          active_users: activeUsers,
          new_registrations: newRegistrations,
          total_meals: totalMeals,
          total_stories: totalStories,
          total_messages: totalMessages,
          total_comments: totalComments,
          average_session_duration: avgSessionDuration,
          most_used_features: mostUsedFeatures
        },
        { upsert: true, new: true }
      );

      console.log('Daily analytics generated successfully');
    } catch (error) {
      console.error('Error generating daily analytics:', error);
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(days: number = 30): Promise<any> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const appAnalytics = await AppAnalytics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      const userAnalytics = await UserAnalytics.find({
        date: { $gte: startDate, $lte: endDate }
      });

      // Calculate growth metrics
      const userGrowth = appAnalytics.length > 1 
        ? ((appAnalytics[appAnalytics.length - 1].total_users - appAnalytics[0].total_users) / appAnalytics[0].total_users) * 100
        : 0;

      const engagementRate = appAnalytics.length > 0
        ? (appAnalytics[appAnalytics.length - 1].active_users / appAnalytics[appAnalytics.length - 1].total_users) * 100
        : 0;

      return {
        totalUsers: appAnalytics[appAnalytics.length - 1]?.total_users || 0,
        activeUsers: appAnalytics[appAnalytics.length - 1]?.active_users || 0,
        userGrowth,
        engagementRate,
        totalMeals: appAnalytics[appAnalytics.length - 1]?.total_meals || 0,
        totalStories: appAnalytics[appAnalytics.length - 1]?.total_stories || 0,
        averageSessionDuration: appAnalytics[appAnalytics.length - 1]?.average_session_duration || 0,
        mostUsedFeatures: appAnalytics[appAnalytics.length - 1]?.most_used_features || [],
        dailyData: appAnalytics.map(day => ({
          date: day.date,
          activeUsers: day.active_users,
          newRegistrations: day.new_registrations
        }))
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }
}

export default new AnalyticsService();


import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPost extends Document {
  user_id: mongoose.Types.ObjectId;
  dish_name: string;
  dietary_group: string[];
  portion_size: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  pickup_time_window: {
    start: Date;
    end: Date;
  };
  allergens: string[];
  additional_notes?: string;
  availability_dates: Date[];
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

const mealPostSchema = new Schema<IMealPost>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dish_name: {
    type: String,
    required: [true, 'Dish name is required'],
    trim: true,
    minlength: [2, 'Dish name must be at least 2 characters long'],
    maxlength: [100, 'Dish name cannot exceed 100 characters']
  },
  dietary_group: [{
    type: String,
    enum: [
      'vegan',
      'vegetarian',
      'halal',
      'kosher',
      'gluten-free',
      'dairy-free',
      'nut-free',
      'keto',
      'paleo',
      'low-carb',
      'other'
    ],
    required: true
  }],
  portion_size: {
    type: Number,
    required: [true, 'Portion size is required'],
    min: [1, 'Portion size must be at least 1'],
    max: [20, 'Portion size cannot exceed 20']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    }
  },
  pickup_time_window: {
    start: {
      type: Date,
      required: [true, 'Pickup start time is required']
    },
    end: {
      type: Date,
      required: [true, 'Pickup end time is required'],
      validate: {
        validator: function(this: IMealPost, endTime: Date) {
          return endTime > this.pickup_time_window.start;
        },
        message: 'Pickup end time must be after start time'
      }
    }
  },
  allergens: [{
    type: String,
    trim: true,
    maxlength: [50, 'Allergen name cannot exceed 50 characters']
  }],
  additional_notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Additional notes cannot exceed 500 characters']
  },
  availability_dates: [{
    type: Date,
    required: true,
    validate: {
      validator: function(date: Date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 7); // 7 days from now
        return date >= today && date <= maxDate;
      },
      message: 'Availability date must be between today and 7 days from now'
    }
  }],
  is_available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create 2dsphere index for geospatial queries
mealPostSchema.index({ location: '2dsphere' });

// Create compound indexes for common queries
mealPostSchema.index({ user_id: 1, created_at: -1 });
mealPostSchema.index({ dietary_group: 1, is_available: 1 });
mealPostSchema.index({ availability_dates: 1, is_available: 1 });
mealPostSchema.index({ pickup_time_window: 1, is_available: 1 });

export default mongoose.model<IMealPost>('MealPost', mealPostSchema);


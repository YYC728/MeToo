export interface User {
  _id: string;
  stage_name: string;
  university_email: string;
  is_email_verified: boolean;
  disclosure_preferences: {
    university_visibility: boolean;
  };
  blocked_users: string[];
  created_at: string;
  updated_at: string;
}

export interface MealPost {
  _id: string;
  user_id: string | User;
  dish_name: string;
  dietary_group: string[];
  portion_size: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  pickup_time_window: {
    start: string;
    end: string;
  };
  allergens: string[];
  additional_notes?: string;
  availability_dates: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MeTooStory {
  _id: string;
  user_id: string | User | null;
  text_content: string;
  media_attachments: string[];
  privacy_level: 'public' | 'restricted' | 'anonymous';
  tags: string[];
  comment_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  _id: string;
  story_id: string;
  user_id: string | User | null;
  text_content: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LoginCredentials {
  university_email: string;
  password: string;
}

export interface RegisterData {
  stage_name: string;
  university_email: string;
  password: string;
}

export interface CreateMealData {
  dish_name: string;
  dietary_group: string[];
  portion_size: number;
  location: {
    latitude: number;
    longitude: number;
  };
  pickup_time_window: {
    start: string;
    end: string;
  };
  allergens?: string[];
  additional_notes?: string;
  availability_dates: string[];
}

export interface CreateStoryData {
  text_content: string;
  media_attachments?: string[];
  privacy_level: 'public' | 'restricted' | 'anonymous';
  tags?: string[];
  comment_enabled?: boolean;
}

export interface CreateCommentData {
  text_content: string;
  is_anonymous?: boolean;
}

export interface Message {
  _id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface SocketEvents {
  sendMessage: (data: { receiver_id: string; content: string }) => void;
  joinRoom: (room: string) => void;
  newMessage: (message: Message) => void;
}


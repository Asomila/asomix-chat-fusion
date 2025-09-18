// AsomiX28 Chatbot Configuration
export const CONFIG = {
  // Text API Configuration
  TEXT_API_URL: "https://api.openai.com/v1/chat/completions",
  TEXT_API_KEY: "your-api-key-here",
  TEXT_MODEL: "gpt-3.5-turbo",
  
  // Image API Configuration  
  IMAGE_API_URL: "https://api.openai.com/v1/images/generations",
  IMAGE_API_KEY: "your-api-key-here",
  
  // Admin Configuration
  ADMIN_PASSWORD: "123",
  
  // Storage Configuration
  LOCALSTORAGE_KEY: "asomix28_chat_data",
  
  // Limits
  MAX_FREE_IMAGE_PER_DAY: 5,
  
  // App Information
  APP_NAME: "AsomiX28 Chatbot",
  APP_VERSION: "1.0.0",
  
  // Welcome Message
  WELCOME_MESSAGE: "Hello! Welcome to AsomiX28 Chatbot. I'm here to help you with any questions or tasks you might have. How can I assist you today?",
};

// Types for the chatbot
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: number;
  isImage?: boolean;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatStats {
  totalMessages: number;
  totalConversations: number;
  totalGeneratedImages: number;
  totalVisitors: number;
  imagesGeneratedToday: number;
  lastImageGenDate: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  loginTime: number;
}
import { CONFIG } from "./config";
import type { Conversation, ChatStats, AdminSession } from "./config";

// Local Storage Keys
const STORAGE_KEYS = {
  CONVERSATIONS: `${CONFIG.LOCALSTORAGE_KEY}_conversations`,
  CURRENT_CONVERSATION: `${CONFIG.LOCALSTORAGE_KEY}_current`,
  STATS: `${CONFIG.LOCALSTORAGE_KEY}_stats`,
  ADMIN_SESSION: `${CONFIG.LOCALSTORAGE_KEY}_admin`,
  VISITORS: `${CONFIG.LOCALSTORAGE_KEY}_visitors`,
};

// Initialize visitor tracking
export const initializeVisitorTracking = () => {
  const visitorsData = localStorage.getItem(STORAGE_KEYS.VISITORS);
  if (!visitorsData) {
    const visitorId = generateId();
    localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify([visitorId]));
    return 1;
  }
  
  const visitors = JSON.parse(visitorsData);
  return visitors.length;
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Conversation Management
export const saveConversation = (conversation: Conversation) => {
  const conversations = getConversations();
  const existingIndex = conversations.findIndex(c => c.id === conversation.id);
  
  if (existingIndex >= 0) {
    conversations[existingIndex] = conversation;
  } else {
    conversations.push(conversation);
  }
  
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, JSON.stringify(conversation));
  
  // Update stats
  updateStats();
};

export const getConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  return stored ? JSON.parse(stored) : [];
};

export const getCurrentConversation = (): Conversation | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
  return stored ? JSON.parse(stored) : null;
};

export const createNewConversation = (): Conversation => {
  const conversation: Conversation = {
    id: generateId(),
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, JSON.stringify(conversation));
  return conversation;
};

export const deleteAllConversations = () => {
  localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION);
  // Reset stats
  const stats = getStats();
  const resetStats: ChatStats = {
    ...stats,
    totalMessages: 0,
    totalConversations: 0,
    totalGeneratedImages: 0,
  };
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(resetStats));
};

// Stats Management
export const getStats = (): ChatStats => {
  const stored = localStorage.getItem(STORAGE_KEYS.STATS);
  const visitors = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITORS) || "[]");
  
  if (stored) {
    const stats = JSON.parse(stored);
    return {
      ...stats,
      totalVisitors: visitors.length,
    };
  }
  
  const defaultStats: ChatStats = {
    totalMessages: 0,
    totalConversations: 0,
    totalGeneratedImages: 0,
    totalVisitors: visitors.length,
    imagesGeneratedToday: 0,
    lastImageGenDate: "",
  };
  
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(defaultStats));
  return defaultStats;
};

export const updateStats = () => {
  const conversations = getConversations();
  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
  const totalImages = conversations.reduce((sum, conv) => 
    sum + conv.messages.filter(msg => msg.isImage).length, 0
  );
  
  const visitors = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITORS) || "[]");
  
  const stats: ChatStats = {
    totalMessages,
    totalConversations: conversations.length,
    totalGeneratedImages: totalImages,
    totalVisitors: visitors.length,
    imagesGeneratedToday: getTodayImageCount(),
    lastImageGenDate: getLastImageGenDate(),
  };
  
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
};

export const getTodayImageCount = (): number => {
  const today = new Date().toDateString();
  const conversations = getConversations();
  
  let count = 0;
  conversations.forEach(conv => {
    conv.messages.forEach(msg => {
      if (msg.isImage && new Date(msg.timestamp).toDateString() === today) {
        count++;
      }
    });
  });
  
  return count;
};

export const getLastImageGenDate = (): string => {
  const conversations = getConversations();
  let lastDate = 0;
  
  conversations.forEach(conv => {
    conv.messages.forEach(msg => {
      if (msg.isImage && msg.timestamp > lastDate) {
        lastDate = msg.timestamp;
      }
    });
  });
  
  return lastDate ? new Date(lastDate).toLocaleDateString() : "";
};

// Admin Session Management
export const saveAdminSession = (session: AdminSession) => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
};

export const getAdminSession = (): AdminSession | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
  return stored ? JSON.parse(stored) : null;
};

export const clearAdminSession = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
};

// Export conversations as JSON
export const exportConversationsAsJSON = (): string => {
  const conversations = getConversations();
  const stats = getStats();
  
  const exportData = {
    exportDate: new Date().toISOString(),
    stats,
    conversations,
  };
  
  return JSON.stringify(exportData, null, 2);
};
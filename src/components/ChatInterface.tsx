import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Plus, Settings, Bot, User } from "lucide-react";
import { CONFIG } from "@/lib/config";
import type { Message, Conversation } from "@/lib/config";
import {
  saveConversation,
  getCurrentConversation,
  createNewConversation,
  generateId,
} from "@/lib/storage";

interface ChatInterfaceProps {
  onAdminClick: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAdminClick }) => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation on component mount
    initializeConversation();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [currentConversation?.messages]);

  const initializeConversation = () => {
    let conversation = getCurrentConversation();
    
    if (!conversation) {
      conversation = createNewConversation();
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: generateId(),
        content: CONFIG.WELCOME_MESSAGE,
        role: "assistant",
        timestamp: Date.now(),
      };
      
      conversation.messages.push(welcomeMessage);
      saveConversation(conversation);
    }
    
    setCurrentConversation(conversation);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentConversation) return;

    const userMessage: Message = {
      id: generateId(),
      content: inputMessage.trim(),
      role: "user",
      timestamp: Date.now(),
    };

    // Add user message to conversation
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      updatedAt: Date.now(),
    };

    setCurrentConversation(updatedConversation);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulate API call (replace with actual API integration)
      const botResponse = await simulateBotResponse(userMessage.content);
      
      const botMessage: Message = {
        id: generateId(),
        content: botResponse,
        role: "assistant",
        timestamp: Date.now(),
      };

      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, botMessage],
        updatedAt: Date.now(),
      };

      setCurrentConversation(finalConversation);
      saveConversation(finalConversation);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: generateId(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: Date.now(),
      };

      const errorConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, errorMessage],
        updatedAt: Date.now(),
      };

      setCurrentConversation(errorConversation);
      saveConversation(errorConversation);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateBotResponse = async (userInput: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple response simulation (replace with actual API integration)
    const responses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're asking. Here's what I think...",
      "Thanks for your message! I'm here to assist you.",
      "Let me provide you with some information about that.",
      "I'd be happy to help you with that request.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleNewConversation = () => {
    const newConversation = createNewConversation();
    
    // Add welcome message to new conversation
    const welcomeMessage: Message = {
      id: generateId(),
      content: CONFIG.WELCOME_MESSAGE,
      role: "assistant",
      timestamp: Date.now(),
    };
    
    newConversation.messages.push(welcomeMessage);
    saveConversation(newConversation);
    setCurrentConversation(newConversation);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-background">
      {/* Header */}
      <Card className="bg-chat-header border-border shadow-soft">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{CONFIG.APP_NAME}</h1>
              <p className="text-sm text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewConversation}
              className="bg-secondary hover:bg-secondary-hover border-border"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAdminClick}
              className="bg-secondary hover:bg-secondary-hover border-border"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {currentConversation?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-user-message-bg"
                      : "bg-bot-message-bg"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-user-message-text" />
                  ) : (
                    <Bot className="w-4 h-4 text-bot-message-text" />
                  )}
                </div>
                
                {/* Message Content */}
                <Card
                  className={`p-3 shadow-soft ${
                    message.role === "user"
                      ? "bg-user-message-bg border-user-message text-user-message-text"
                      : "bg-bot-message-bg border-border text-bot-message-text"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </Card>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-8 h-8 bg-bot-message-bg rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-bot-message-text" />
                </div>
                <Card className="bg-bot-message-bg border-border p-3 shadow-soft">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-bot-message-text rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-bot-message-text rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-bot-message-text rounded-full animate-bounce delay-200" />
                  </div>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <Card className="bg-chat-header border-border shadow-soft">
        <div className="p-4">
          <div className="flex space-x-3 max-w-4xl mx-auto">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1 bg-input border-input-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-soft"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
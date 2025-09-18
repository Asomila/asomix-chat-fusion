import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Download,
  Trash2,
  Eye,
  MessageSquare,
  Users,
  Image,
  BarChart3,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CONFIG } from "@/lib/config";
import type { ChatStats, AdminSession, Conversation } from "@/lib/config";
import {
  getStats,
  getAdminSession,
  saveAdminSession,
  clearAdminSession,
  getConversations,
  deleteAllConversations,
  exportConversationsAsJSON,
} from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const session = getAdminSession();
    if (session && session.isAuthenticated) {
      // Check if session is still valid (24 hours)
      const now = Date.now();
      const sessionAge = now - session.loginTime;
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge < maxSessionAge) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        clearAdminSession();
      }
    }
  }, []);

  const handleLogin = () => {
    if (password === CONFIG.ADMIN_PASSWORD) {
      const session: AdminSession = {
        isAuthenticated: true,
        loginTime: Date.now(),
      };
      
      saveAdminSession(session);
      setIsAuthenticated(true);
      setPassword("");
      loadDashboardData();
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setPassword("");
    setStats(null);
    setConversations([]);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const loadDashboardData = () => {
    const currentStats = getStats();
    const currentConversations = getConversations();
    
    setStats(currentStats);
    setConversations(currentConversations);
  };

  const handleExportData = () => {
    try {
      const jsonData = exportConversationsAsJSON();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `asomix28_conversations_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Conversations exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export conversations.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllConversations = () => {
    deleteAllConversations();
    loadDashboardData();
    setShowDeleteConfirm(false);
    
    toast({
      title: "Data Deleted",
      description: "All conversations have been deleted.",
    });
  };

  const viewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationDialog(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-strong">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">Admin Panel</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter the admin password to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input border-input-border text-foreground"
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={!password}
              className="w-full bg-gradient-primary hover:bg-primary-hover text-primary-foreground"
            >
              Login to Admin Panel
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full bg-secondary hover:bg-secondary-hover border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-card border-border shadow-soft">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                {CONFIG.APP_NAME} Administration Panel
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary-hover border-border"
              >
                Logout
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-secondary hover:bg-secondary-hover border-border"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border shadow-soft">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-admin-info/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-admin-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalMessages}</p>
                    <p className="text-sm text-muted-foreground">Total Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-soft">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-admin-success/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-admin-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalConversations}</p>
                    <p className="text-sm text-muted-foreground">Total Conversations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-soft">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-admin-warning/20 rounded-full flex items-center justify-center">
                    <Image className="w-6 h-6 text-admin-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalGeneratedImages}</p>
                    <p className="text-sm text-muted-foreground">Generated Images</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-soft">
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalVisitors}</p>
                    <p className="text-sm text-muted-foreground">Total Visitors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions and Conversation Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="bg-card border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your chatbot data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleExportData}
                className="w-full bg-admin-success hover:bg-admin-success/90 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-admin-error hover:bg-admin-error/90"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Conversations
              </Button>
              
              <Separator className="bg-border" />
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Daily Image Limit</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today: {stats?.imagesGeneratedToday || 0}</span>
                  <span className="text-sm text-muted-foreground">Max: {CONFIG.MAX_FREE_IMAGE_PER_DAY}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-admin-info h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((stats?.imagesGeneratedToday || 0) / CONFIG.MAX_FREE_IMAGE_PER_DAY) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Log */}
          <Card className="lg:col-span-2 bg-card border-border shadow-soft">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Conversations</CardTitle>
              <CardDescription className="text-muted-foreground">
                View and manage conversation history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            {conversation.messages.length} messages
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(conversation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-1">
                          Started: {new Date(conversation.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewConversation(conversation)}
                        className="bg-secondary hover:bg-secondary-hover border-border"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {conversations.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No conversations yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversation Detail Dialog */}
      <Dialog open={showConversationDialog} onOpenChange={setShowConversationDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Conversation Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedConversation &&
                `Created: ${new Date(selectedConversation.createdAt).toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {selectedConversation?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-user-message-bg text-user-message-text ml-8"
                      : "bg-bot-message-bg text-bot-message-text mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={message.role === "user" ? "default" : "secondary"}>
                      {message.role === "user" ? "User" : "Assistant"}
                    </Badge>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center">
              <AlertCircle className="w-5 h-5 text-admin-error mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete all conversations
              and chat history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-secondary hover:bg-secondary-hover border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllConversations}
              className="bg-admin-error hover:bg-admin-error/90"
            >
              Delete All
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
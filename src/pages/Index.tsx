import React, { useState, useEffect } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { AdminPanel } from "@/components/AdminPanel";
import { initializeVisitorTracking } from "@/lib/storage";

const Index = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    // Initialize visitor tracking on app start
    initializeVisitorTracking();
  }, []);

  return (
    <>
      {showAdminPanel ? (
        <AdminPanel onBack={() => setShowAdminPanel(false)} />
      ) : (
        <ChatInterface onAdminClick={() => setShowAdminPanel(true)} />
      )}
    </>
  );
};

export default Index;

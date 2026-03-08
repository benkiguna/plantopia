"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui";
import { createBrowserClient } from "@/lib/supabase/client";

export function PushPromptView() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Only show if supported and not already granted/denied
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPermission(Notification.permission);
      
      // Delay showing the prompt slightly so it's not jarring on load
      if (Notification.permission === "default") {
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const subscribeToPush = async () => {
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === "granted") {
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID public key would be from env
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        
        if (!publicVapidKey) {
          console.warn("No VAPID key present. Skipping pure push subscription.");
          setIsVisible(false);
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        
        // Save to Supabase profile
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await supabase
            .from("profiles")
            .update({ push_subscription: JSON.parse(JSON.stringify(subscription)) })
            .eq("id", session.user.id);
        }
      }
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
    } finally {
      setIsLoading(false);
      setIsVisible(false); // Hide after action taken
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Optionally save dismissed state in localStorage to avoid nagging
    localStorage.setItem("plantopia_push_dismissed", "true");
  };

  if (!isVisible || permission !== "default") return null;
  if (typeof window !== "undefined" && localStorage.getItem("plantopia_push_dismissed") === "true") return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <Card className="bg-forest text-cream border-none shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green/20 rounded-bl-full -z-0"></div>
        <div className="relative z-10 p-5">
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-cream/70 hover:text-cream"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-green text-cream flex items-center justify-center text-xl flex-shrink-0 mr-4">
              🔔
            </div>
            <div>
              <h3 className="font-bold mb-1">Stay on top of plant care</h3>
              <p className="text-sm text-cream/80 mb-4 pr-4">
                Enable notifications so we can remind you when your plants need water or fertilizer.
              </p>
              
              <button 
                onClick={subscribeToPush}
                disabled={isLoading}
                className="bg-amber hover:bg-amber/90 text-forest font-bold py-2 px-4 rounded-full text-sm transition-colors"
              >
                {isLoading ? "Enabling..." : "Enable Reminders"}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Utility for VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

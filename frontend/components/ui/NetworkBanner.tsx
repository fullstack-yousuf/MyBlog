"use client";
import React, { useEffect, useState, useRef } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import {
  ExclamationCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function NetworkBanner() {
  const online = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  // Track initial load to skip showing "Connected" at page load
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!online) {
      // Offline: show immediately
      setVisible(true);
      setOpacity(1);
      initialLoad.current = false; // after offline state, subsequent online shows banner
    } else {
      // Online
      if (initialLoad.current) {
        // Skip showing "Connected" on initial load
        initialLoad.current = false;
        setVisible(false);
        setOpacity(0);
      } else {
        // Show briefly then fade out
        setVisible(true);
        setOpacity(1);
        const timer = setTimeout(() => {
          setOpacity(0);
          setTimeout(() => setVisible(false), 500); // match transition
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [online]);

  if (!visible) return null;

  return (
    <div
     className={`fixed top-4 inset-x-4 max-w-sm mx-auto rounded-lg shadow-lg p-4 flex items-center justify-center space-x-3 ${
  online ? "bg-green-600" : "bg-red-600"
} text-white transition-opacity duration-500`}

      style={{ opacity }}
    >
      <div className="flex-shrink-0">
        {online ? (
          <CheckIcon className="h-6 w-6 text-white" />
        ) : (
          <ExclamationCircleIcon className="h-6 w-6 text-white" />
        )}
      </div>
      <div className="font-medium text-sm">{online ? "Connected" : "You’re offline"}</div>
    </div>
  );
}

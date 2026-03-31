"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="flex items-center justify-center bg-red-500 px-4 py-1 text-xs font-semibold text-white">
      You are currently offline. Check your internet connection.
    </div>
  );
};

export default OfflineBanner;

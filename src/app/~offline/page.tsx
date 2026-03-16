"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-4 max-w-sm">
        <div className="flex items-center justify-center size-16 rounded-full bg-neutral-gray-200">
          <WifiOff className="size-8 text-neutral-gray-400" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-foreground">
            You&apos;re offline
          </h1>
          <p className="text-sm text-neutral-gray-400">
            It looks like you&apos;ve lost your internet connection. Check your
            network and try again.
          </p>
        </div>

        <Button onClick={handleRetry} className="mt-2 max-w-48">
          Try again
        </Button>
      </div>
    </div>
  );
};

export default OfflinePage;

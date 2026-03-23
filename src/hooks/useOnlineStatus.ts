import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

const getSnapshot = () => {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
};

const getServerSnapshot = () => {
  return true;
};

export const useOnlineStatus = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

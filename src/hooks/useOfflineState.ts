import { useEffect, useState } from "react";

export const useOfflineState = () => {
  const [isOffline, setIsOffline] = useState(window.navigator.onLine);

  useEffect(() => {
    const handler = () => setIsOffline(window.navigator.onLine);

    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);

    return () => {
      window.removeEventListener('online', handler);
      window.removeEventListener('offline', handler);
    };
  }, []);

  return isOffline;
};

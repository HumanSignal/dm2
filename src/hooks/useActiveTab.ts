import { useEffect, useState } from "react";

/**
 * Indicates if the current browser's tab is active
 */
export const useActiveTab = () => {
  const [active, setActive] = useState(!document.hidden);

  useEffect(() => {
    const handler = () => setActive(!document.hidden);

    document.addEventListener('visibilitychange', handler);

    return () => {
      document.removeEventListener('visibilitychange', handler);
    };
  }, []);

  return active;
};

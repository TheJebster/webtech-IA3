import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const whenIdle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1500));
const done = new Set();

// Fetches the code of the other pages in the background, one at a time, once the browser is idle.
// Store pages load for everyone; the admin pages (charts are heavy) only for admins.
// Skipped when the visitor has data saver on.
export default function PagePreloader({ loaders, storePages, adminPages }) {
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (navigator.connection?.saveData) return undefined;
    let cancelled = false;
    const queue = [...storePages, ...(isAdmin ? adminPages : [])].filter((name) => !done.has(name));
    const next = () => {
      const name = queue.shift();
      if (cancelled || !name) return;
      done.add(name);
      loaders[name]()
        .catch(() => done.delete(name)) // a failed fetch is retried on the real visit
        .finally(() => whenIdle(next));
    };
    // Wait for the current page to settle before starting
    const start = setTimeout(() => whenIdle(next), 2000);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [isAdmin, loaders, storePages, adminPages]);

  return null;
}

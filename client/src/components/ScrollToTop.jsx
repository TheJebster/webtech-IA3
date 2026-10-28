import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToElement, scrollToTop } from '../motion/engine';

// Scroll to the top when the page changes, or to #anchor targets (which may render a moment later)
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      scrollToTop();
      return undefined;
    }
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(hash.slice(1));
      if (el || ++tries > 20) {
        clearInterval(timer);
        if (el) scrollToElement(el);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [pathname, hash]);
  return null;
}

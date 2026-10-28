import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { EASE, gsap, getLenis, reducedMotion, ScrollTrigger, startSmoothScroll, stopSmoothScroll } from './engine';
import { createRevealer } from './reveal';

// Site-wide motion: smooth scrolling, scroll reveals and the page-change "curtain"
// (floema.com sweeps a fluor bar across the top of the screen between pages).
export default function MotionLayer() {
  const { pathname } = useLocation();
  const barRef = useRef(null);
  const first = useRef(true);

  // Smooth scroll + reveals for the lifetime of the app
  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    startSmoothScroll();
    const stopReveal = createRevealer(document.getElementById('root'));

    // Pause smooth scrolling while a Bootstrap modal is open (it locks the page)
    const bodyWatch = new MutationObserver(() => {
      const lenis = getLenis();
      if (!lenis) return;
      if (document.body.classList.contains('modal-open')) lenis.stop();
      else lenis.start();
    });
    bodyWatch.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => {
      bodyWatch.disconnect();
      stopReveal();
      stopSmoothScroll();
    };
  }, []);

  // Curtain sweep + content rise on every page change (and once on first load)
  useEffect(() => {
    if (reducedMotion()) return undefined;
    const main = document.querySelector('main');
    const tl = gsap.timeline();
    tl.set(barRef.current, { scaleX: 0, transformOrigin: '0% 50%', autoAlpha: 1 })
      .to(barRef.current, { scaleX: 1, duration: first.current ? 0.7 : 0.45, ease: 'power3.inOut' })
      .set(barRef.current, { transformOrigin: '100% 50%' })
      .to(barRef.current, { scaleX: 0, duration: 0.9, ease: EASE });
    if (main) {
      // Opacity only (never visibility: hidden), so the text stays readable for screen readers throughout
      tl.fromTo(main, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: EASE, clearProps: 'opacity,transform' }, first.current ? 0.35 : 0.2);
    }
    first.current = false;
    // New page layout: let ScrollTrigger re-measure once things settle
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => {
      clearTimeout(refresh);
      tl.kill();
      if (main) gsap.set(main, { clearProps: 'opacity,transform' });
    };
  }, [pathname]);

  return (
    <div className="curtain" aria-hidden="true">
      <div className="curtain-bar" ref={barRef} />
    </div>
  );
}

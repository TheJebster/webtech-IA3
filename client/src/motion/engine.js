// Motion engine, modelled on floema.com: Lenis smooth scrolling driven by the GSAP ticker,
// ScrollTrigger kept in sync, and an expo-out ease on everything.
// Everything here is a no-op when the visitor prefers reduced motion.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Floema's signature curve: cubic-bezier(.19, 1, .22, 1) — GSAP's expo.out
export const EASE = 'expo.out';

let lenis = null;
let tick = null;

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startSmoothScroll() {
  if (lenis || reducedMotion()) return lenis;
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    // Let scrollable panels (modals, filters, tables, phone menu) scroll natively
    prevent: (node) => Boolean(node.closest?.('.modal, .navbar-collapse, .filters, .table-responsive, .compare, .dropdown-menu, [data-lenis-prevent]')),
  });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function stopSmoothScroll() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
}

export const getLenis = () => lenis;

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToElement(el) {
  if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.4, force: true });
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

export { gsap, ScrollTrigger };

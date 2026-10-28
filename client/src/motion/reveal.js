// Scroll reveals, applied automatically to every page (like floema.com's section reveals):
//  - blocks fade and rise in, staggered when several enter together   -> data-rv
//  - photos wipe open top to bottom over a fluor layer, then settle   -> data-rvm
//  - split headings (SplitText) slide each word up out of a mask      -> data-rv on .split
// Data attributes (not classes) are used so React re-renders never reset the state.

const BLOCKS = [
  '.equipment-card', '.bezel', '.package-card', '.collection-row', '.panel', '.stat', '.rental-card',
  '.table-responsive', '.compare', '.prompt-search', '.stat-row', '.scroll-cue', '.section-head .btn',
  '.request-line', '.catalog-item', '.results-bar', '.auth-frame', '.footer-card', '.footer-bottom',
  '.lead-strong', '.lead-muted', '.badge-dark-pill', '.eyebrow', '.page-header p', '.cat-chip',
  '.navy-band .text-muted', '.breadcrumb', '.buy-box', '.empty-state',
].join(', ');

const MEDIA = ['.equipment-card .thumb', '.gallery-main', '.product-media', '.package-card .cover', '.float-card .visual'].join(', ');

const SPLIT = '.split';

// Never animate inside overlays or the header
const SKIP = '.modal, .toast, .site-header, .dropdown-menu, .nav-backdrop, .offcanvas';

const STAGGER_MS = 70;
const MAX_STAGGER = 8;

export function createRevealer(root) {
  if (!('IntersectionObserver' in window)) return () => {};

  // A fully clipped photo never counts as visible to IntersectionObserver, so each
  // photo is watched through its parent (the "sentinel") instead
  const mediaBySentinel = new Map();

  const reveal = (el, delay) => {
    el.style.setProperty('--rv-delay', `${delay}ms`);
    if (el.hasAttribute('data-rv')) el.setAttribute('data-rv', 'in');
    if (el.hasAttribute('data-rvm')) el.setAttribute('data-rvm', 'in');
    // Drop the stagger delay once revealed, so hover transitions start instantly
    setTimeout(() => el.style.removeProperty('--rv-delay'), 1800);
  };

  const io = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      // Reveal in reading order so a row of cards ripples left to right
      entering.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      entering.forEach((el, i) => {
        const delay = Math.min(i, MAX_STAGGER) * STAGGER_MS;
        if (el.getAttribute('data-rv') === 'pending') reveal(el, delay);
        mediaBySentinel.get(el)?.forEach((media) => reveal(media, delay));
        mediaBySentinel.delete(el);
        io.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
  );

  const tag = (el, attr) => {
    if (el.hasAttribute(attr) || el.closest(SKIP)) return;
    // Nested blocks ride along with their parent's reveal
    if (attr === 'data-rv' && el.parentElement?.closest('[data-rv]')) return;
    el.setAttribute(attr, 'pending');
    if (attr === 'data-rvm') {
      const sentinel = el.parentElement || el;
      if (!mediaBySentinel.has(sentinel)) mediaBySentinel.set(sentinel, new Set());
      mediaBySentinel.get(sentinel).add(el);
      io.observe(sentinel);
    } else {
      io.observe(el);
    }
  };

  const scan = (node) => {
    if (!(node instanceof Element)) return;
    const pick = (selector, attr) => {
      if (node.matches(selector)) tag(node, attr);
      node.querySelectorAll(selector).forEach((el) => tag(el, attr));
    };
    pick(SPLIT, 'data-rv');
    pick(BLOCKS, 'data-rv');
    pick(MEDIA, 'data-rvm');
  };

  scan(root);
  // MutationObserver callbacks run before the browser paints, so new content never flashes
  const mo = new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach(scan)));
  mo.observe(root, { childList: true, subtree: true });

  return () => {
    mo.disconnect();
    io.disconnect();
    // Untag anything still waiting, so a fresh revealer can pick it up again
    root.querySelectorAll('[data-rv="pending"]').forEach((el) => el.removeAttribute('data-rv'));
    root.querySelectorAll('[data-rvm="pending"]').forEach((el) => el.removeAttribute('data-rvm'));
  };
}

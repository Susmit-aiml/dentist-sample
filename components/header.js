/* ==========================================================================
   Header — Sticky + Mobile Drawer + Overlay
   ========================================================================== */
export function initHeader() {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  /* Scroll toggle */
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* Hamburger open/close */
  function openMenu() {
    drawer?.classList.add('active');
    overlay?.classList.add('active');
    hamburger?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    drawer?.classList.remove('active');
    overlay?.classList.remove('active');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = drawer?.classList.contains('active');
    isOpen ? closeMenu() : openMenu();
  });

  overlay?.addEventListener('click', closeMenu);
  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

  /* Escape key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

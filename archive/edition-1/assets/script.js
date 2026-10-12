(() => {
  'use strict';
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };
  const toggle = document.querySelector('.font-toggle');
  function setSize(large) {
    document.documentElement.classList.toggle('large-type', large);
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(large));
      toggle.textContent = large ? 'Обычный текст' : 'Крупнее текст';
    }
  }
  setSize(store.get('book-large-type') === 'true');
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const large = !document.documentElement.classList.contains('large-type');
      setSize(large);
      store.set('book-large-type', String(large));
      updateProgress();
    });
  }
  const bar = document.querySelector('.reading-progress');
  function updateProgress() {
    if (!bar) return;
    const height = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, scrollY / height)) : 0})`;
  }
  if (!bar) return;
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { updateProgress(); queued = false; });
  }, { passive: true });
  addEventListener('resize', updateProgress);
  // Save only the current chapter position. Native history restores back/forward visits.
  const key = 'book-position:' + location.pathname;
  addEventListener('pagehide', () => store.set(key, String(Math.round(scrollY))));
  addEventListener('load', () => {
    const previous = Number(store.get(key));
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!location.hash && navigation?.type === 'navigate' && previous > 0) {
      window.scrollTo({ top: previous, behavior: 'instant' });
    }
    updateProgress();
  });
})();

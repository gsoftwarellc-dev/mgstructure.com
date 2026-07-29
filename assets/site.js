/* Mega Structure — lightweight site behaviour (replaces the React runtime) */
(function () {
  'use strict';

  /* 1. Scroll reveal: elements marked [data-reveal] fade+rise into view. */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    var show = function (el) {
      el.classList.remove('opacity-0', 'motion-safe:translate-y-6');
      el.classList.add('opacity-100');
    };
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, show);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* 2. Mobile navigation toggle. */
  function initNav() {
    var btn = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('hidden') === false;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* 3. Services mega-menu: opens on hover (desktop) and click/keyboard. */
  function initDropdown() {
    document.querySelectorAll('[data-dropdown]').forEach(function (dd) {
      var trigger = dd.querySelector('[data-dropdown-trigger]');
      var menu = dd.querySelector('[data-dropdown-menu]');
      if (!trigger || !menu) return;

      var closeTimer;
      var open = function () {
        clearTimeout(closeTimer);
        menu.classList.remove('hidden');
        trigger.setAttribute('aria-expanded', 'true');
      };
      var close = function () {
        menu.classList.add('hidden');
        trigger.setAttribute('aria-expanded', 'false');
      };
      var closeSoon = function () { closeTimer = setTimeout(close, 160); };

      // Hover to open; a touch sets a flag so tapping doesn't double-fire.
      var touched = false;
      dd.addEventListener('touchstart', function () { touched = true; }, { passive: true });
      dd.addEventListener('mouseenter', function () { if (!touched) open(); });
      dd.addEventListener('mouseleave', function () { if (!touched) closeSoon(); });

      // Click always toggles (touch + keyboard)
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        menu.classList.contains('hidden') ? open() : close();
      });

      document.addEventListener('click', function (e) { if (!dd.contains(e.target)) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      dd.addEventListener('focusout', function (e) {
        if (!dd.contains(e.relatedTarget)) close();
      });
    });
  }

  /* 4. FAQ / accordion toggles. */
  function initAccordion() {
    document.querySelectorAll('[data-accordion-trigger]').forEach(function (t) {
      t.addEventListener('click', function () {
        var panel = t.nextElementSibling;
        if (!panel) return;
        var open = panel.classList.toggle('hidden') === false;
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  function boot() { initReveal(); initNav(); initDropdown(); initAccordion(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();

/* Keep the mega-menu inside the viewport regardless of trigger position. */
(function () {
  function clamp() {
    document.querySelectorAll('[data-dropdown-menu]').forEach(function (m) {
      if (m.classList.contains('hidden')) return;
      var dd = m.parentElement;
      var trig = dd.querySelector('[data-dropdown-trigger]');
      var tr = trig.getBoundingClientRect(), ddr = dd.getBoundingClientRect();
      // centre the panel on the trigger's midpoint
      m.style.left = Math.round(tr.left + tr.width / 2 - ddr.left) + 'px';
      m.style.transform = 'translateX(-50%)';
      var r = m.getBoundingClientRect(), pad = 12, shift = 0;
      if (r.left < pad) shift = pad - r.left;
      else if (r.right > window.innerWidth - pad) shift = (window.innerWidth - pad) - r.right;
      if (shift) m.style.transform = 'translateX(calc(-50% + ' + Math.round(shift) + 'px))';
    });
  }
  ['mouseover', 'click', 'resize', 'scroll'].forEach(function (e) {
    window.addEventListener(e, function () { setTimeout(clamp, 0); }, true);
  });
})();

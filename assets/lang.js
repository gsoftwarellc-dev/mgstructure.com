/* Mega Structure — EN/AR language switcher powered by Google Translate.
   No page duplication: Google translates the live DOM in the browser.
   Choice persists across pages via a cookie (the same one Google reads). */
(function () {
  'use strict';

  var LANGS = ['en', 'ar'];
  var DEFAULT = 'en';

  /* ---- cookie helpers -------------------------------------------------
     Google Translate reads/writes `googtrans` in the form "/en/ar".
     We write it on the bare host and (when applicable) the dotted domain,
     because Google only picks it up if the scope matches.                */
  function hosts() {
    var h = location.hostname, out = [''];          // '' = current host only
    if (h.indexOf('.') > -1 && !/^[\d.]+$/.test(h)) out.push('.' + h.replace(/^www\./, ''));
    return out;
  }
  function setGoogTrans(lang) {
    var val = lang === DEFAULT ? '' : '/' + DEFAULT + '/' + lang;
    hosts().forEach(function (d) {
      var base = 'googtrans=' + (val ? encodeURIComponent(val) : '') + ';path=/';
      var dom = d ? ';domain=' + d : '';
      document.cookie = val
        ? base + dom
        : 'googtrans=;path=/' + dom + ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
  }
  /* ?lang=ar wins over everything else. Cookies and localStorage are
     partitioned (or blocked outright) inside a cross-origin iframe, so an
     embedded copy can only be told its language through the URL. */
  function urlLang() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q && LANGS.indexOf(q) > -1) return q;
    } catch (e) {}
    return null;
  }

  function currentLang() {
    var u = urlLang();
    if (u) return u;

    var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if (m) {
      var parts = decodeURIComponent(m[1]).split('/');
      var l = parts[parts.length - 1];
      if (LANGS.indexOf(l) > -1) return l;
    }
    try {
      var s = localStorage.getItem('ms-lang');
      if (LANGS.indexOf(s) > -1) return s;
    } catch (e) {}
    return DEFAULT;
  }

  /* True when we cannot rely on our own cookies surviving a reload. */
  function embedded() {
    try { return window.top !== window.self; } catch (e) { return true; }
  }

  /* ---- direction ------------------------------------------------------ */
  function applyDir(lang) {
    var rtl = lang === 'ar';
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }

  /* ---- build the EN | AR control -------------------------------------- */
  function makeSwitcher(extraClass) {
    var wrap = document.createElement('div');
    wrap.className = 'ms-lang' + (extraClass ? ' ' + extraClass : '');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Select language / اختر اللغة');
    // Not translated by Google — labels must stay literal.
    wrap.setAttribute('translate', 'no');
    wrap.classList.add('notranslate');

    [['en', 'EN', 'English'], ['ar', 'AR', 'العربية']].forEach(function (l, i) {
      if (i) {
        var sep = document.createElement('span');
        sep.className = 'ms-lang-sep';
        sep.setAttribute('aria-hidden', 'true');
        wrap.appendChild(sep);
      }
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = l[1];
      b.setAttribute('data-lang', l[0]);
      b.setAttribute('lang', l[0]);
      b.title = l[2];
      b.setAttribute('aria-label', l[2]);
      b.addEventListener('click', function () { switchTo(l[0]); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function markActive(lang) {
    document.querySelectorAll('.ms-lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  /* ---- switching ------------------------------------------------------ */
  function switchTo(lang) {
    if (LANGS.indexOf(lang) < 0 || lang === currentLang()) return;
    try { localStorage.setItem('ms-lang', lang); } catch (e) {}
    setGoogTrans(lang);

    // Carry the choice in the URL so it survives the reload even when the
    // cookie is partitioned away (iframe) — and so links stay shareable.
    var url = new URL(location.href);
    if (lang === DEFAULT) url.searchParams.delete('lang');
    else url.searchParams.set('lang', lang);
    location.replace(url.toString());
  }

  /* ---- Google Translate bootstrap ------------------------------------- */
  function loadGoogle() {
    if (document.getElementById('ms-gt-script')) return;
    var host = document.createElement('div');
    host.id = 'google_translate_element';
    document.body.appendChild(host);

    window.msTranslateInit = function () {
      try {
        new google.translate.TranslateElement({
          pageLanguage: DEFAULT,
          includedLanguages: LANGS.join(','),
          autoDisplay: false
        }, 'google_translate_element');
      } catch (e) {}
    };
    var s = document.createElement('script');
    s.id = 'ms-gt-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=msTranslateInit';
    s.async = true;
    document.body.appendChild(s);
  }

  /* ---- mount ----------------------------------------------------------- */
  function mount() {
    var lang = currentLang();
    applyDir(lang);

    // Google's widget picks its target language from the googtrans cookie,
    // not from our state — so when ?lang= is present, sync the cookie to it
    // before the widget boots. This also clears a stale Arabic cookie when
    // ?lang=en (or no param plus an explicit English choice) is requested,
    // which otherwise leaves plain URLs stuck in Arabic.
    if (urlLang()) setGoogTrans(lang);

    // Desktop: into the header actions cluster (next to the phone pill).
    var deskAnchor = document.querySelector('header .hidden.items-center.gap-3.lg\\:flex');
    if (deskAnchor && !deskAnchor.querySelector('.ms-lang')) {
      deskAnchor.insertBefore(makeSwitcher(), deskAnchor.firstChild);
    }
    // Mobile: into the slide-down nav panel.
    var panel = document.querySelector('[data-nav-panel] > div');
    if (panel && !panel.querySelector('.ms-lang')) {
      panel.appendChild(makeSwitcher('ms-lang-mobile'));
    }
    markActive(lang);

    // Inside an iframe the cookie may not survive navigation, so stamp
    // ?lang= onto same-site links to carry the choice from page to page.
    if (lang !== DEFAULT && embedded()) keepLangOnLinks(lang);

    // Only pull in Google's script when Arabic is actually in use.
    if (lang !== DEFAULT) loadGoogle();
  }

  function keepLangOnLinks(lang) {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      var u;
      try { u = new URL(href, location.href); } catch (e) { return; }
      if (u.origin !== location.origin) return;      // leave outbound links alone
      u.searchParams.set('lang', lang);
      a.setAttribute('href', u.pathname + u.search + u.hash);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

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
  function currentLang() {
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
    // Reload so Google re-renders the whole document in the new language.
    location.reload();
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

    // Only pull in Google's script when Arabic is actually in use.
    if (lang !== DEFAULT) loadGoogle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

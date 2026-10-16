// USUL — small progressive enhancements. The site works without JS.
(function () {
  var root = document.documentElement;

  // ---- Mobile menu ----
  var toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- English / Arabic toggle (flips the whole layout to RTL) ----
  var langBtn = document.querySelector('.lang-toggle');
  function setLang(lang) {
    var ar = lang === 'ar';
    root.lang = ar ? 'ar' : 'en';
    root.dir = ar ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-ar]').forEach(function (el) {
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);
      el.innerHTML = ar ? el.getAttribute('data-ar') : el.getAttribute('data-en');
    });
    if (langBtn) {
      langBtn.textContent = ar ? 'English' : 'عربي';
      langBtn.setAttribute('aria-label', ar ? 'Switch to English' : 'Switch to Arabic');
    }
    try { localStorage.setItem('usul-lang', lang); } catch (e) {}
  }
  if (langBtn) {
    langBtn.addEventListener('click', function () { setLang(root.lang === 'ar' ? 'en' : 'ar'); });
    var saved = null;
    try { saved = localStorage.getItem('usul-lang'); } catch (e) {}
    if (saved === 'ar') setLang('ar');
  }

  // ---- Fragrance tabs ----
  var tabs = document.querySelectorAll('[role="tab"][data-tab]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
      document.querySelectorAll('[data-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== tab.getAttribute('data-tab');
      });
    });
  });

  // ---- Toast ----
  var toastEl = document.querySelector('.toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  // ---- Bag ----
  var bagCount = 0;
  try { bagCount = parseInt(localStorage.getItem('usul-bag') || '0', 10) || 0; } catch (e) {}
  function renderBag() {
    document.querySelectorAll('.bag-count').forEach(function (el) { el.textContent = bagCount; });
  }
  renderBag();
  var addForm = document.querySelector('.add-form');
  if (addForm) {
    addForm.addEventListener('submit', function (e) {
      e.preventDefault();
      bagCount += 1;
      try { localStorage.setItem('usul-bag', String(bagCount)); } catch (err) {}
      renderBag();
      var size = addForm.querySelector('input[name="size"]:checked');
      toast((root.lang === 'ar' ? 'أُضيف إلى الحقيبة' : 'Added to bag') + (size ? ' — ' + size.value : ''));
    });
    // Keep the displayed price in sync with the selected size.
    var priceEl = addForm.querySelector('.buy__price');
    addForm.querySelectorAll('input[name="size"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (priceEl && input.dataset.price) priceEl.textContent = '$' + input.dataset.price;
      });
    });
  }

  // ---- Newsletter: subscribes to the Klaviyo "Newsletter" list (double opt-in) ----
  var KLAVIYO_SITE_ID = 'WcGiKb';
  var KLAVIYO_LIST_ID = 'Rv3X3e';
  var letter = document.querySelector('.newsletter');
  if (letter) {
    letter.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = letter.querySelector('input[type="email"]');
      var button = letter.querySelector('button[type="submit"]');
      var note = letter.querySelector('.form-note');
      var email = input ? input.value.trim() : '';
      var ar = root.lang === 'ar';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = ar ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.';
        return;
      }
      button.disabled = true;
      note.textContent = ar ? 'جارٍ الاشتراك…' : 'Subscribing…';
      fetch('https://a.klaviyo.com/client/subscriptions?company_id=' + KLAVIYO_SITE_ID, {
        method: 'POST',
        headers: { 'Content-Type': 'application/vnd.api+json', revision: '2024-10-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: 'Website newsletter form',
              profile: { data: { type: 'profile', attributes: { email: email } } }
            },
            relationships: { list: { data: { type: 'list', id: KLAVIYO_LIST_ID } } }
          }
        })
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        note.textContent = ar
          ? 'أهلاً بك في المجموعة. تحقّق من بريدك لتأكيد الاشتراك.'
          : 'Welcome to the Collective. Check your inbox to confirm.';
        input.value = '';
      }).catch(function () {
        note.textContent = ar ? 'تعذّر الاشتراك. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.';
      }).then(function () {
        button.disabled = false;
      });
    });
  }

  // ---- Transparent header over the hero turns solid once scrolled ----
  var header = document.querySelector('.header');
  if (header && !header.classList.contains('header--solid')) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
})();

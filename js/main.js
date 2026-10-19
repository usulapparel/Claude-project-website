// USUL — small progressive enhancements. The site works without JS.
(function () {
  var root = document.documentElement;
  var FREE_SHIP = 100; // free shipping threshold, in dollars
  var money = function (n) { return '$' + n.toFixed(2); };
  var isAr = function () { return root.lang === 'ar'; };

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
    renderProduct();
  }
  if (langBtn) {
    langBtn.addEventListener('click', function () { setLang(isAr() ? 'en' : 'ar'); });
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

  // ---- Bag (front-end only; count and total persist in localStorage) ----
  var bag = { count: 0, total: 0 };
  try { bag = JSON.parse(localStorage.getItem('usul-bag-v2')) || bag; } catch (e) {}
  function saveBag() {
    try { localStorage.setItem('usul-bag-v2', JSON.stringify(bag)); } catch (e) {}
    document.querySelectorAll('.bag-count').forEach(function (el) { el.textContent = bag.count; });
  }
  saveBag();

  // ---- Product gallery ----
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var thumbs = gallery.querySelectorAll('.gallery__thumbs button');
    gallery.classList.toggle('gallery--single', thumbs.length < 2);
    var mainImg = gallery.querySelector('.gallery__main img');
    var shotLabel = gallery.querySelector('.shot-label');
    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        thumbs.forEach(function (b) { b.setAttribute('aria-current', String(b === btn)); });
        mainImg.src = btn.getAttribute('data-src');
        if (shotLabel) shotLabel.textContent = (isAr() && btn.getAttribute('data-label-ar')) || btn.getAttribute('data-label');
      });
    });
  }

  // ---- Product page: options, quantity, add to bag, upsell dialog ----
  var form = document.querySelector('.add-form');
  var upsell = document.querySelector('.upsell');
  var qty = 1;

  function checked(name) { return form.querySelector('input[name="' + name + '"]:checked'); }
  function optionLabel(name) {
    var input = checked(name);
    if (!input) return '';
    return (isAr() && input.getAttribute('data-ar-label')) || input.value;
  }
  function renderProduct() {
    if (!form) return;
    var price = parseFloat(form.getAttribute('data-price')) || 0;
    var line = price * qty;
    var ar = isAr();
    form.querySelector('output[name="qty"]').textContent = qty;
    document.querySelectorAll('[data-opt-label="color"]').forEach(function (el) { el.textContent = optionLabel('color'); });
    document.querySelectorAll('[data-opt-label="size"]').forEach(function (el) { el.textContent = optionLabel('size'); });
    var addBtn = form.querySelector('[data-add-label]');
    if (!addBtn.classList.contains('is-added')) {
      addBtn.textContent = (ar ? 'أضف إلى الحقيبة — ' : 'Add to bag — ') + money(line);
    }
    var ship = form.querySelector('[data-ship-line]');
    ship.textContent = line >= FREE_SHIP
      ? (ar ? 'الشحن المجاني متاح.' : 'Free shipping unlocked.')
      : (ar ? 'يتبقى ' + money(FREE_SHIP - line) + ' للشحن المجاني.' : money(FREE_SHIP - line) + ' away from free shipping.');
    renderUpsell();
  }
  function renderUpsell() {
    if (!upsell) return;
    var ar = isAr();
    var remaining = Math.max(0, FREE_SHIP - bag.total);
    upsell.querySelector('[data-bag-total]').textContent = (ar ? 'إجمالي الحقيبة ' : 'Bag total ') + money(bag.total);
    upsell.querySelector('[data-upsell-ship]').textContent = remaining > 0
      ? (ar ? 'يتبقى ' + money(remaining) + ' للشحن المجاني.' : "You're " + money(remaining) + ' away from free shipping.')
      : (ar ? 'الشحن المجاني متاح.' : 'Free shipping unlocked.');
    upsell.querySelector('[data-meter]').style.width = Math.min(100, Math.round(bag.total / FREE_SHIP * 100)) + '%';
    upsell.querySelector('[data-checkout]').textContent = (ar ? 'الدفع — ' : 'Checkout — ') + money(bag.total);
  }

  if (form) {
    form.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.addEventListener('change', renderProduct);
    });
    form.querySelectorAll('[data-qty]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qty = Math.min(9, Math.max(1, qty + parseInt(btn.getAttribute('data-qty'), 10)));
        renderProduct();
      });
    });

    var addedTimer;
    function addToBag() {
      var price = parseFloat(form.getAttribute('data-price')) || 0;
      bag.count += qty;
      bag.total += price * qty;
      saveBag();

      var addBtn = form.querySelector('[data-add-label]');
      addBtn.classList.add('is-added');
      addBtn.textContent = isAr() ? 'أُضيف إلى الحقيبة ✓' : 'Added to bag ✓';
      clearTimeout(addedTimer);
      addedTimer = setTimeout(function () { addBtn.classList.remove('is-added'); renderProduct(); }, 1800);

      if (upsell && typeof upsell.showModal === 'function') {
        var name = form.getAttribute('data-name') + ' — ' + optionLabel('color') + ' / ' + optionLabel('size') + (qty > 1 ? ' × ' + qty : '');
        upsell.querySelector('[data-added-name]').textContent = name;
        upsell.querySelector('.upsell__item img').src = form.getAttribute('data-img');
        renderUpsell();
        upsell.showModal();
      } else {
        toast((isAr() ? 'أُضيف إلى الحقيبة' : 'Added to bag') + ' — ' + optionLabel('size'));
      }
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); addToBag(); });
    document.querySelectorAll('[data-add-proxy]').forEach(function (btn) {
      btn.addEventListener('click', addToBag);
    });
    renderProduct();
  }

  if (upsell) {
    upsell.querySelectorAll('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { upsell.close(); });
    });
    // Click on the backdrop closes the dialog
    upsell.addEventListener('click', function (e) { if (e.target === upsell) upsell.close(); });
    upsell.querySelectorAll('[data-rec-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        bag.count += 1;
        bag.total += parseFloat(btn.getAttribute('data-price')) || 0;
        saveBag();
        btn.disabled = true;
        btn.textContent = isAr() ? 'أُضيف ✓' : 'Added ✓';
        renderUpsell();
      });
    });
  }

  // ---- Newsletter ----
  var letter = document.querySelector('.newsletter');
  if (letter) {
    letter.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = letter.querySelector('input[type="email"]');
      var note = letter.querySelector('.form-note');
      var ok = input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      note.textContent = ok
        ? (isAr() ? 'أهلاً بك في المجموعة.' : 'Welcome to the Collective.')
        : (isAr() ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      if (ok) input.value = '';
    });
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

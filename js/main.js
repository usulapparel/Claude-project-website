// USUL — small progressive enhancements. The site works without JS.
(function () {
  var root = document.documentElement;
  var FREE_SHIP = 100; // free shipping threshold, in dollars
  var money = function (n) { return '$' + n.toFixed(2); };
  // Marcellus (the display face) has no Ṣ: write it as an S with the dot drawn by CSS (see .dot in styles.css).
  function dotted(text) {
    return text.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; })
      .replace(/Ṣ/g, '<span class="dot">S</span>').replace(/ṣ/g, '<span class="dot">s</span>');
  }
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

  // ---- Bag ----
  // Items are kept here (Shopify variant ID -> quantity) and handed to the Shopify store
  // through a cart permalink (/cart/<variant>:<qty>,...) when the shopper checks out.
  var SHOP_URL = 'https://usulapparel.com';
  var bag = { count: 0, total: 0, lines: {} };
  try { bag = JSON.parse(localStorage.getItem('usul-bag-v3')) || bag; } catch (e) {}
  function checkoutUrl() {
    var items = Object.keys(bag.lines).map(function (id) { return id + ':' + bag.lines[id]; });
    return SHOP_URL + (items.length ? '/cart/' + items.join(',') : '/cart');
  }
  function saveBag() {
    try { localStorage.setItem('usul-bag-v3', JSON.stringify(bag)); } catch (e) {}
    document.querySelectorAll('.bag-count').forEach(function (el) { el.textContent = bag.count; });
    document.querySelectorAll('.bag-btn, [data-checkout]').forEach(function (el) { el.href = checkoutUrl(); });
  }
  function addLine(variant, n, price) {
    bag.lines[variant] = (bag.lines[variant] || 0) + n;
    bag.count += n;
    bag.total += price * n;
    saveBag();
  }
  // Once the items are handed to Shopify, the store's own cart holds them.
  document.querySelectorAll('.bag-btn, [data-checkout]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (!bag.count) return;
      el.href = checkoutUrl();
      bag = { count: 0, total: 0, lines: {} };
      try { localStorage.setItem('usul-bag-v3', JSON.stringify(bag)); } catch (e) {}
    });
  });
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
    function selectedVariant() {
      try { return JSON.parse(form.getAttribute('data-variants'))[checked('color').value][checked('size').value]; } catch (e) { return null; }
    }
    function addToBag() {
      var price = parseFloat(form.getAttribute('data-price')) || 0;
      var variant = selectedVariant();
      if (!variant) return;
      addLine(variant, qty, price);

      var addBtn = form.querySelector('[data-add-label]');
      addBtn.classList.add('is-added');
      addBtn.textContent = isAr() ? 'أُضيف إلى الحقيبة ✓' : 'Added to bag ✓';
      clearTimeout(addedTimer);
      addedTimer = setTimeout(function () { addBtn.classList.remove('is-added'); renderProduct(); }, 1800);

      if (upsell && typeof upsell.showModal === 'function') {
        var name = form.getAttribute('data-name') + ' — ' + optionLabel('color') + ' / ' + optionLabel('size') + (qty > 1 ? ' × ' + qty : '');
        upsell.querySelector('[data-added-name]').innerHTML = dotted(name);
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

  // ---- One-tap add (fragrance page): the button carries its Shopify variant and price ----
  document.querySelectorAll('[data-add-variant]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      addLine(btn.getAttribute('data-add-variant'), 1, parseFloat(btn.getAttribute('data-price')) || 0);
      var name = (isAr() && btn.getAttribute('data-name-ar')) || btn.getAttribute('data-name');
      toast((isAr() ? 'أُضيف إلى الحقيبة' : 'Added to bag') + ' — ' + name);
    });
  });

  if (upsell) {
    upsell.querySelectorAll('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { upsell.close(); });
    });
    // Click on the backdrop closes the dialog
    upsell.addEventListener('click', function (e) { if (e.target === upsell) upsell.close(); });
    upsell.querySelectorAll('[data-rec-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Apparel picks are added in the size chosen on this page.
        var variant = btn.getAttribute('data-variant');
        if (!variant && form) {
          try { variant = JSON.parse(btn.getAttribute('data-variants'))[checked('size').value]; } catch (e) {}
        }
        if (!variant) return;
        addLine(variant, 1, parseFloat(btn.getAttribute('data-price')) || 0);
        btn.disabled = true;
        btn.textContent = isAr() ? 'أُضيف ✓' : 'Added ✓';
        renderUpsell();
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
      var ar = isAr();
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

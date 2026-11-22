// USUL — product pages. product.html is one template for the whole catalog:
//
//   product.html                 the Ṣumūd tee, written into the page by hand (story, specs, Arabic copy, photos).
//                                Only its prices and stock are refreshed from the store here.
//   product.html?p=<handle>      any other product. Its name, photos, colors, sizes, prices, stock and description
//                                are read from the Shopify store when the page opens, so nothing is copied or goes stale.
//
// The store's public product feed (usulapparel.com/products/<handle>.js) is the source. If it can't be reached, the
// Ṣumūd page keeps working as written and other products show a short message with a link to the store.
// This file loads before main.js, which waits on USUL_PRODUCT_READY and then wires up the gallery, options and bag.
(function () {
  var SHOP_URL = 'https://usulapparel.com';
  var SITE_URL = 'https://shop.usulapparel.com';
  var OWN = 'ṣumud'; // ṣumud, the handle of the product written into product.html
  var FRAGRANCES = { perfume: 'levant', 'deset-rose': 'desert-rose', 'rose-oud': 'rose-oud', yasmin: 'yasmin' }; // these live on fragrances.html
  var root = document.documentElement;
  var form = document.querySelector('.add-form');
  if (!form) return;

  var handle = '';
  try { handle = (new URLSearchParams(location.search).get('p') || '').trim().normalize('NFC'); } catch (e) {}
  if (FRAGRANCES[handle]) { location.replace('fragrances.html#' + FRAGRANCES[handle]); return; }
  var own = !handle || handle === OWN;
  if (own) handle = OWN;

  // Swatch colors for the color names the store uses. A name that isn't here is shown as a text button instead.
  var COLORS = {
    'Black': '#1b1b1b', 'Bone': '#e3dcc9', 'Brown': '#5b4636', 'Brown Savana': '#8a6a4a', 'Burgundy': '#5e1f2d',
    'Charcoal Heather': '#4a4d52', 'Cypress': '#5d6b52', 'Dark Grey': '#4b4b4d', 'Dark Grey Heather': '#55575a',
    'Faded Black': '#2b2b2b', 'Faded Bone': '#e8e0cd', 'Faded Eucalyptus': '#7d8a72', 'Faded Khaki': '#a39677',
    'Forest Green': '#1f3d2b', 'Light Pink': '#f3d3d9', 'Military Green': '#5a5f41', 'Multicam Black': '#2a2b28',
    'Natural': '#efe6d0', 'Navy': '#1c2541', 'Navy Blazer': '#232b45', 'Olive': '#5b5a37', 'Oyster': '#e6dfd0',
    'Pink': '#f2b8c6', 'Sand': '#d8c7a3', 'Sport Grey': '#a9abad', 'Spruce': '#2f4f45', 'Vintage Black': '#2d2c2b',
    'White': '#ffffff'
  };
  var COLORS_AR = {
    'Black': 'أسود', 'White': 'أبيض', 'Navy': 'كحلي', 'Pink': 'وردي', 'Light Pink': 'وردي فاتح', 'Brown': 'بني',
    'Burgundy': 'عنّابي', 'Olive': 'زيتوني', 'Sand': 'رملي', 'Forest Green': 'أخضر غامق', 'Military Green': 'أخضر عسكري',
    'Dark Grey': 'رمادي غامق', 'Natural': 'طبيعي', 'Bone': 'عظمي', 'Faded Black': 'أسود باهت', 'Faded Bone': 'عظمي باهت',
    'Faded Eucalyptus': 'أوكالبتوس باهت'
  };
  var SIZE_ORDER = ['XXS', 'XS', 'S', 'S/M', 'M', 'M/L', 'L', 'L/XL', 'XL', '2XL', 'XXL', '3XL', '4XL', '5XL'];

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  // Marcellus has no Ṣ: an S with the dot drawn by CSS (see .dot in styles.css).
  function dotted(text) { return esc(text).replace(/Ṣ/g, '<span class="dot">S</span>').replace(/ṣ/g, '<span class="dot">s</span>'); }
  function money(cents) { return '$' + (cents / 100).toFixed(2); }
  function sized(src, width) {
    src = String(src).replace(/^\/\//, 'https://');
    return src + (src.indexOf('?') < 0 ? '?' : '&') + 'width=' + width;
  }
  function slug(text) { return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function fileName(src) { return String(src).split('?')[0].split('/').pop().toLowerCase(); }
  function inputName(option, index) {
    if (/^colou?r$/i.test(option.name)) return 'color';
    if (/^size$/i.test(option.name)) return 'size';
    return 'opt' + (index + 1);
  }

  function fetchProduct() {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    return fetch(SHOP_URL + '/products/' + encodeURIComponent(handle) + '.js', ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (p) { clearTimeout(timer); return p; });
  }

  // The store's variants in the shape main.js reads: { id, o: [option values], p: dollars, a: in stock }.
  function writeVariants(p, names) {
    form.setAttribute('data-option-names', names.join('|'));
    form.setAttribute('data-variant-list', JSON.stringify(p.variants.map(function (v) {
      return { id: v.id, o: v.options.slice(0, names.length), p: v.price / 100, a: v.available !== false };
    })));
  }

  // ---- The Ṣumūd page: keep everything as written, refresh prices and stock ----
  if (own) {
    window.USUL_PRODUCT_READY = null; // main.js sets the page up straight away from what is written in it
    fetchProduct().then(function (p) {
      var colors = [].map.call(form.querySelectorAll('input[name="color"]'), function (i) { return i.value; });
      var sizes = [].map.call(form.querySelectorAll('input[name="size"]'), function (i) { return i.value; });
      var names = p.options.map(inputName);
      // Only trust the feed if it still describes the colors and sizes on the page.
      var fits = names.join('|') === 'color|size' &&
        colors.every(function (c) { return p.options[0].values.indexOf(c) > -1; }) &&
        sizes.every(function (s) { return p.options[1].values.indexOf(s) > -1; });
      if (!fits) return;
      writeVariants(p, names);
      if (window.USUL_renderProduct) window.USUL_renderProduct();
    }).catch(function () {});
    return;
  }

  // ---- Any other product: fill the template in ----
  function hideOwn() {
    document.querySelectorAll('[data-own]').forEach(function (el) {
      if (el.tagName === 'SCRIPT') el.parentNode.removeChild(el); else el.hidden = true;
    });
    var gallery = document.querySelector('[data-gallery]');
    if (gallery) gallery.classList.add('gallery--fit'); // store photos are mostly square mockups: show them whole
  }
  // Replace an element with a clean copy, dropping the Ṣumūd text the language toggle would otherwise bring back.
  function fresh(el, html) {
    var copy = document.createElement(el.tagName);
    copy.className = el.className;
    ['href', 'rel', 'aria-label', 'name', 'open'].forEach(function (a) { if (el.hasAttribute(a)) copy.setAttribute(a, el.getAttribute(a)); });
    copy.innerHTML = html;
    el.parentNode.replaceChild(copy, el);
    return copy;
  }

  // The store's descriptions are the owner's own HTML, but only plain formatting is let through.
  var ALLOWED = { P: 1, UL: 1, OL: 1, LI: 1, STRONG: 1, B: 1, EM: 1, I: 1, BR: 1, TABLE: 1, THEAD: 1, TBODY: 1, TR: 1, TD: 1, TH: 1, IMG: 1 };
  function clean(node, out) {
    [].forEach.call(node.childNodes, function (child) {
      if (child.nodeType === 3) { out.appendChild(document.createTextNode(child.nodeValue)); return; }
      if (child.nodeType !== 1) return;
      var tag = child.tagName;
      if (/^(SCRIPT|STYLE|IFRAME|META|LINK|OBJECT|EMBED|FORM)$/.test(tag)) return;
      if (/^H[1-6]$/.test(tag)) {
        var p = document.createElement('p'), strong = document.createElement('strong');
        clean(child, strong); p.appendChild(strong); out.appendChild(p); return;
      }
      if (!ALLOWED[tag]) { clean(child, tag === 'DIV' ? out.appendChild(document.createElement('p')) : out); return; }
      if (tag === 'IMG') {
        var src = child.getAttribute('src') || '';
        if (!/^https:\/\/cdn\.shopify\.com\//.test(src)) return;
        var img = document.createElement('img');
        img.src = src; img.alt = child.getAttribute('alt') || ''; img.loading = 'lazy';
        out.appendChild(img); return;
      }
      var el = document.createElement(tag);
      clean(child, el);
      out.appendChild(el);
    });
  }
  function describe(html) {
    var doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
    var box = document.createElement('div');
    box.className = 'rte';
    clean(doc.body.firstChild, box);
    // Drop what the cleanup left empty, and line breaks that open a block.
    [].slice.call(box.querySelectorAll('p, li, ul, ol, b, strong, em, i')).reverse().forEach(function (el) {
      if (!el.textContent.trim() && !el.querySelector('img')) el.parentNode.removeChild(el);
    });
    [].forEach.call(box.querySelectorAll('p, li'), function (el) {
      while (el.firstChild && (el.firstChild.tagName === 'BR' || (el.firstChild.nodeType === 3 && !el.firstChild.nodeValue.trim()))) el.removeChild(el.firstChild);
    });
    // The opening paragraph goes under the title; the rest goes in "Details and fit".
    var lead = '';
    var first = box.querySelector('p, li');
    if (first && !first.querySelector('img, br')) {
      var text = first.textContent.replace(/\s+/g, ' ').trim();
      if (text.length >= 60 && text.length <= 520) {
        lead = text;
        var holder = first.parentNode;
        holder.removeChild(first);
        if (holder !== box && !holder.textContent.trim()) holder.parentNode.removeChild(holder);
      }
    }
    return { lead: lead, rest: box };
  }

  function render(p) {
    var title = p.title;
    var url = SITE_URL + '/product.html?p=' + encodeURIComponent(handle);
    var storeUrl = SHOP_URL + '/products/' + encodeURIComponent(handle);
    var desc = describe(p.description);
    var images = (p.images || []).slice(0, 12);
    hideOwn();

    // -- Options: names, order, the first variant in stock --
    var options = (p.options || []).filter(function (o) { return !(o.name === 'Title' && o.values.length === 1); });
    var names = options.map(inputName);
    var start = p.variants.filter(function (v) { return v.available !== false; })[0] || p.variants[0];
    var colorAt = names.indexOf('color');

    // -- Head: title, description, sharing and search tags --
    var plain = (desc.lead || title).slice(0, 180);
    var titleEl = document.querySelector('title');
    titleEl.removeAttribute('data-ar'); titleEl.removeAttribute('data-en');
    titleEl.textContent = title + ' | UṢŪL';
    var set = function (sel, attr, value) { var el = document.querySelector(sel); if (el) el.setAttribute(attr, value); };
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) { metaDesc.removeAttribute('data-ar-content'); metaDesc.removeAttribute('data-en-content'); metaDesc.content = plain; }
    set('meta[property="og:title"]', 'content', title + ' | UṢŪL');
    set('meta[property="og:description"]', 'content', plain);
    set('meta[property="og:url"]', 'content', url);
    if (images[0]) set('meta[property="og:image"]', 'content', sized(images[0], 1200));
    set('meta[property="product:price:amount"]', 'content', (start.price / 100).toFixed(2));
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon) { canon.removeAttribute('data-self'); canon.href = url; }
    set('link[hreflang="en"]', 'href', url);
    set('link[hreflang="x-default"]', 'href', url);
    set('link[hreflang="ar"]', 'href', url + '&lang=ar');
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: title, description: plain,
      image: images.slice(0, 2).map(function (src) { return sized(src, 1200); }),
      brand: { '@type': 'Brand', name: 'Usul Collective' }, url: storeUrl,
      offers: { '@type': 'Offer', price: (start.price / 100).toFixed(2), priceCurrency: 'USD', url: storeUrl,
        availability: 'https://schema.org/' + (p.available === false ? 'OutOfStock' : 'InStock') }
    });
    document.head.appendChild(ld);

    // -- Gallery: one thumbnail per photo, tied to a color where the photo shows one --
    var colors = colorAt > -1 ? options[colorAt].values : [];
    var byFile = {}; // photo file -> color, from the variants that name it as their photo
    p.variants.forEach(function (v) {
      if (colorAt > -1 && v.featured_image && v.featured_image.src) byFile[fileName(v.featured_image.src)] = v.options[colorAt];
    });
    function colorOf(src) {
      var file = fileName(src);
      if (byFile[file]) return byFile[file];
      var best = '';
      colors.forEach(function (c) { var s = slug(c); if (s && file.indexOf(s) > -1 && s.length > slug(best).length) best = c; });
      return best;
    }
    var startColor = colorAt > -1 ? start.options[colorAt] : '';
    var shots = images.map(function (src) { return { src: src, color: colorOf(src) }; });
    var shown = shots.filter(function (s) { return !s.color || s.color === startColor; });
    var opening = shown.filter(function (s) { return s.color === startColor && startColor; })[0] || shown[0] || shots[0];
    var thumbs = document.querySelector('.gallery__thumbs');
    thumbs.innerHTML = shots.map(function (s, i) {
      return '<button type="button" aria-current="' + (s === opening) + '"' + (s.color ? ' data-color="' + esc(s.color) + '"' : '') +
        (shown.indexOf(s) < 0 ? ' hidden' : '') + ' data-src="' + esc(sized(s.src, 1200)) + '" data-alt="' + esc(title + (s.color ? ', ' + s.color : '')) + '">' +
        '<img src="' + esc(sized(s.src, 200)) + '" alt="" loading="lazy"><span class="visually-hidden">' + esc('Photo ' + (i + 1)) + '</span></button>';
    }).join('');
    var mainImg = document.querySelector('.gallery__main img');
    if (opening) { mainImg.src = sized(opening.src, 1200); mainImg.alt = title + (opening.color ? ', ' + opening.color : ''); }
    else mainImg.removeAttribute('src');
    if (p.compare_at_price && p.compare_at_price > p.price) {
      var badge = document.querySelector('.gallery__main .badge');
      if (badge) { badge = fresh(badge, 'Sale'); badge.setAttribute('data-ar', 'تخفيض'); badge.hidden = false; }
    }

    // -- Name, price, opening paragraph --
    fresh(document.querySelector('.crumbs'), '<a href="shop.html" data-ar="المتجر">Shop</a> / <span>' + esc(title) + '</span>');
    var h1 = document.querySelector('.pdp__title');
    h1.innerHTML = dotted(title);
    h1.classList.toggle('pdp__title--long', title.length > 14);
    var price = document.querySelector('.pdp__price');
    if (start.compare_at_price && start.compare_at_price > start.price) {
      price.removeAttribute('data-price-label');
      price.innerHTML = '<s>' + money(start.compare_at_price) + '</s> <span data-price-label>' + money(start.price) + '</span>';
    } else price.textContent = money(start.price);
    var rating = fresh(document.querySelector('.pdp__rating'), 'Reviews on the store');
    rating.href = storeUrl + '#judgeme_product_reviews';
    rating.setAttribute('data-ar', 'التقييمات في المتجر');
    var lead = document.querySelector('.pdp__desc');
    if (desc.lead) fresh(lead, esc(desc.lead)); else lead.hidden = true;

    // -- Color and size pickers --
    [].forEach.call(form.querySelectorAll('fieldset.opt'), function (el) { el.parentNode.removeChild(el); });
    var buyRow = form.querySelector('.buy-row');
    options.forEach(function (option, i) {
      var name = names[i];
      var values = option.values.slice();
      if (name === 'size' && values.every(function (v) { return SIZE_ORDER.indexOf(v) > -1; })) {
        values.sort(function (a, b) { return SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b); });
      }
      var swatches = name === 'color' && values.every(function (v) { return COLORS[v]; });
      var label = name === 'color' ? '<span data-ar="اللون">Color</span>' : name === 'size' ? '<span data-ar="المقاس">Size</span>' : esc(option.name);
      var fieldset = document.createElement('fieldset');
      fieldset.className = 'opt ' + (swatches ? 'swatch' : 'size');
      fieldset.innerHTML = '<legend class="opt__head eyebrow"><span>' + label + ' — <span data-opt-label="' + name + '">' + esc(start.options[i]) + '</span></span></legend>' +
        '<div class="choices">' + values.map(function (v) {
          var ar = name === 'color' && COLORS_AR[v] ? ' data-ar-label="' + esc(COLORS_AR[v]) + '"' : '';
          return '<label><input type="radio" name="' + name + '" value="' + esc(v) + '"' + ar + (v === start.options[i] ? ' checked' : '') + '>' +
            (swatches ? '<span style="--c:' + COLORS[v] + '"></span><span class="visually-hidden">' + esc(v) + '</span>' : '<span>' + esc(v) + '</span>') + '</label>';
        }).join('') + '</div>';
      form.insertBefore(fieldset, buyRow);
    });
    form.setAttribute('data-name', title);
    form.setAttribute('data-price', (start.price / 100).toFixed(2));
    form.setAttribute('data-img', opening ? sized(opening.src, 300) : '');
    form.removeAttribute('data-variants');
    writeVariants(p, names);

    // -- Details: the rest of the store's description --
    var details = document.querySelector('.acc details');
    if (details) {
      var old = details.querySelector('p');
      if (desc.rest.textContent.trim() || desc.rest.querySelector('img')) { if (old) details.replaceChild(desc.rest, old); else details.appendChild(desc.rest); }
      else { details.hidden = true; var next = details.nextElementSibling; if (next) next.open = true; }
    }

    // -- Around the product --
    var trust = document.querySelector('[data-trust-first]');
    if (trust) { trust = fresh(trust, 'Made to order'); trust.setAttribute('data-ar', 'يُصنع عند الطلب'); }
    var info = document.querySelector('.sticky-add__info');
    if (info) {
      info.innerHTML = dotted(title) + (names.indexOf('size') > -1 ? ' — <span data-opt-label="size">' + esc(start.options[names.indexOf('size')]) + '</span>' : '') +
        '<span data-price-label>' + money(start.price) + '</span>';
    }
    [].forEach.call(document.querySelectorAll('.pairs .tile'), function (tile) {
      if ((tile.getAttribute('href') || '').split('p=')[1] === handle) tile.hidden = true; // not beside itself
    });
    var added = document.querySelector('[data-added-name]');
    if (added) added.innerHTML = dotted(title);
  }

  function fail() {
    hideOwn();
    var storeUrl = SHOP_URL + '/products/' + encodeURIComponent(handle);
    var pdp = document.querySelector('.pdp');
    var note = document.createElement('section');
    note.className = 'block panel--cream pdp-missing';
    note.innerHTML = '<h1 class="display" data-ar="تعذّر تحميل هذا المنتج">We couldn’t load this product</h1>' +
      '<p data-ar="قد يكون الاتصال انقطع، أو أن المنتج لم يعد متوفرًا. يمكنك فتحه في المتجر أو تصفّح كل المنتجات.">The connection may have dropped, or the product may no longer be available. You can open it on the store, or browse everything.</p>' +
      '<div class="pdp-missing__actions"><a class="btn btn--pine" href="' + esc(storeUrl) + '" data-ar="افتحه في المتجر">Open it on the store</a>' +
      '<a class="btn btn--outline" href="shop.html" data-ar="كل المنتجات">All products</a></div>';
    pdp.parentNode.insertBefore(note, pdp);
    pdp.hidden = true;
    [].forEach.call(document.querySelectorAll('.trust, .sticky-add'), function (el) { el.hidden = true; });
    form.parentNode.removeChild(form); // main.js then leaves the product wiring alone
    var titleEl = document.querySelector('title');
    titleEl.removeAttribute('data-ar'); titleEl.removeAttribute('data-en');
    titleEl.textContent = 'Product | UṢŪL';
  }

  window.USUL_PRODUCT_READY = fetchProduct().then(render).catch(function (err) {
    try { fail(); } catch (e) {}
    if (window.console) console.warn('USUL: product "' + handle + '" could not be loaded.', err);
  }).then(function () { root.classList.remove('pdp-loading'); });
})();

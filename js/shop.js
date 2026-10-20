// USUL — All products page: category, country and sort controls over the catalog in shop-data.js.
// Tiles open the product on the Shopify store, where it can be bought.
(function () {
  var products = window.USUL_PRODUCTS || [];
  var grid = document.querySelector('[data-grid]');
  if (!grid) return;
  var root = document.documentElement;
  var SHOP_URL = 'https://usulapparel.com';
  var PAGE = 12;
  var FRAGRANCES = { perfume: 'levant', 'deset-rose': 'desert-rose', 'rose-oud': 'rose-oud', yasmin: 'yasmin' };

  var CATEGORIES = [
    ['', 'All', 'الكل'],
    ['tees', 'T-shirts', 'تيشيرتات'],
    ['crewnecks', 'Crewnecks', 'كنزات'],
    ['hoodies', 'Hoodies', 'هوديز'],
    ['sweatpants', 'Sweatpants', 'بناطيل رياضية'],
    ['hats', 'Hats', 'قبعات'],
    ['bags', 'Bags', 'حقائب'],
    ['kids', 'Kids', 'أطفال'],
    ['fragrance', 'Fragrance', 'العطور']
  ];
  var COUNTRIES = {
    egypt: ['Egypt', 'مصر'], iraq: ['Iraq', 'العراق'], lebanon: ['Lebanon', 'لبنان'], libya: ['Libya', 'ليبيا'],
    morocco: ['Morocco', 'المغرب'], palestine: ['Palestine', 'فلسطين'], syria: ['Syria', 'سوريا'],
    tunisia: ['Tunisia', 'تونس'], yemen: ['Yemen', 'اليمن']
  };
  var SORTS = [
    ['az', 'A–Z', 'أبجدياً'],
    ['new', 'Newest', 'الأحدث'],
    ['low', 'Price, low to high', 'السعر: من الأقل'],
    ['high', 'Price, high to low', 'السعر: من الأعلى']
  ];

  var params = new URLSearchParams(location.search);
  var state = { cat: params.get('c') || '', country: params.get('country') || '', sort: params.get('sort') || 'az', shown: PAGE };

  var chips = document.querySelector('[data-chips]');
  var countrySel = document.querySelector('[data-country]');
  var sortSel = document.querySelector('[data-sort]');
  var countEl = document.querySelector('[data-shop-count]');
  var moreBtn = document.querySelector('[data-more]');
  var emptyEl = document.querySelector('[data-empty]');

  var isAr = function () { return root.lang === 'ar'; };
  var label = function (en, ar) { return isAr() ? ar : en; };
  var money = function (n) { return '$' + n.toFixed(2); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };
  // Marcellus has no Ṣ: draw the dot with CSS, as main.js does.
  var dotted = function (s) { return esc(s).replace(/Ṣ/g, '<span class="dot">S</span>').replace(/ṣ/g, '<span class="dot">s</span>'); };
  // Shopify's CDN resizes on request.
  var sized = function (url, w) { return url + (url.indexOf('?') < 0 ? '?' : '&') + 'width=' + w; };
  var catName = function (key) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i][0] === key) return label(CATEGORIES[i][1], CATEGORIES[i][2]);
    return '';
  };

  function inCountry(p) { return !state.country || (p.co || []).indexOf(state.country) >= 0; }
  function filtered() {
    var list = products.filter(function (p) { return (!state.cat || p.c === state.cat) && inCountry(p); });
    var by = {
      az: function (a, b) { return a.t.localeCompare(b.t); },
      'new': function (a, b) { return b.d.localeCompare(a.d); },
      low: function (a, b) { return a.p - b.p || a.t.localeCompare(b.t); },
      high: function (a, b) { return b.p - a.p || a.t.localeCompare(b.t); }
    }[state.sort] || null;
    return by ? list.sort(by) : list;
  }

  function tile(p) {
    // The Ṣumūd tee and the fragrances have their own pages on this site.
    var href = p.h === 'ṣumud' ? 'product.html'
      : FRAGRANCES[p.h] ? 'fragrances-scroll.html#' + FRAGRANCES[p.h]
      : SHOP_URL + '/products/' + encodeURIComponent(p.h);
    var sub = [catName(p.c)];
    if (p.n) sub.push(isAr() ? p.n + ' ألوان' : p.n + ' colors');
    var price = p.was
      ? '<s class="muted">' + money(p.was) + '</s> ' + money(p.p)
      : money(p.p);
    var badge = p.sold ? label('Sold out', 'نفد') : p.was ? label('Sale', 'تخفيض') : '';
    return '<a class="tile" href="' + esc(href) + '">' +
      '<div class="plate">' +
        (p.img[0] ? '<img class="img-zoom" src="' + esc(sized(p.img[0], 720)) + '" alt="' + esc(p.t) + '" loading="lazy">' : '') +
        (p.img[1] ? '<img class="tile__alt" src="' + esc(sized(p.img[1], 720)) + '" alt="" loading="lazy">' : '') +
        (badge ? '<span class="badge">' + badge + '</span>' : '') +
      '</div>' +
      '<div class="tile__meta"><div><h3 class="tile__name">' + dotted(p.t) + '</h3><p class="tile__sub">' + esc(sub.join(' · ')) + '</p></div>' +
      '<span class="tile__price">' + price + '</span></div></a>';
  }

  function renderControls() {
    chips.innerHTML = CATEGORIES.map(function (c) {
      var n = products.filter(function (p) { return (!c[0] || p.c === c[0]) && inCountry(p); }).length;
      if (!n && c[0] !== state.cat) return '';
      return '<button type="button" aria-pressed="' + (c[0] === state.cat) + '" data-cat="' + c[0] + '">' +
        label(c[1], c[2]) + ' <span class="muted">' + n + '</span></button>';
    }).join('');
    countrySel.innerHTML = '<option value="">' + label('All', 'الكل') + '</option>' +
      Object.keys(COUNTRIES).map(function (k) {
        return '<option value="' + k + '"' + (k === state.country ? ' selected' : '') + '>' + label(COUNTRIES[k][0], COUNTRIES[k][1]) + '</option>';
      }).join('');
    sortSel.innerHTML = SORTS.map(function (s) {
      return '<option value="' + s[0] + '"' + (s[0] === state.sort ? ' selected' : '') + '>' + label(s[1], s[2]) + '</option>';
    }).join('');
  }

  function render() {
    var list = filtered();
    var shown = Math.min(state.shown, list.length);
    grid.innerHTML = list.slice(0, shown).map(tile).join('');
    countEl.textContent = isAr()
      ? 'عرض ' + shown + ' من ' + list.length + ' منتج'
      : 'Showing ' + shown + ' of ' + list.length + ' products';
    moreBtn.hidden = shown >= list.length;
    emptyEl.hidden = list.length > 0;
    renderControls();
  }

  function update(change) {
    for (var k in change) state[k] = change[k];
    state.shown = PAGE;
    var q = new URLSearchParams();
    if (state.cat) q.set('c', state.cat);
    if (state.country) q.set('country', state.country);
    if (state.sort !== 'az') q.set('sort', state.sort);
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
    render();
  }

  chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (b) update({ cat: b.getAttribute('data-cat') });
  });
  countrySel.addEventListener('change', function () { update({ country: countrySel.value }); });
  sortSel.addEventListener('change', function () { update({ sort: sortSel.value }); });
  moreBtn.addEventListener('click', function () { state.shown += PAGE; render(); });

  // Re-draw in the other language when the عربي / English toggle flips <html lang>.
  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ['lang'] });
  render();
})();

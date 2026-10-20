// USUL — Fragrances, scroll version. Lights up each step as it reaches the middle of the
// screen, tints the page to the scent on screen and keeps the side dots in step.
(function () {
  var page = document.querySelector('.fx');
  if (!page || !('IntersectionObserver' in window)) return;
  var scents = page.querySelectorAll('.fx-scent');
  var steps = page.querySelectorAll('[data-step]');
  var dots = page.querySelector('.fx-dots');
  var header = document.querySelector('.header');

  // Pin the bottles just under the menu, whatever its height on this screen.
  function measure() { if (header) page.style.setProperty('--hdr', header.offsetHeight + 'px'); }
  measure();
  window.addEventListener('resize', measure);

  page.classList.add('fx-ready');

  // A step is "in" while it sits in the reading band: the middle of the screen, or on
  // phones the strip below the pinned bottle.
  var phone = window.matchMedia('(max-width: 820px)');
  var stepIO;
  function watchSteps() {
    if (stepIO) stepIO.disconnect();
    stepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('is-in', e.isIntersecting);
        if (e.isIntersecting) {
          var scent = e.target.closest('.fx-scent');
          scent.setAttribute('data-stage', e.target.getAttribute('data-stage'));
        }
      });
    }, { rootMargin: phone.matches ? '-60% 0px -12% 0px' : '-38% 0px -38% 0px' });
    steps.forEach(function (s) { stepIO.observe(s); });
  }
  watchSteps();
  if (phone.addEventListener) phone.addEventListener('change', watchSteps);

  // The scent covering the middle of the screen sets the page colour and the current dot.
  function setCurrent(scent) {
    scents.forEach(function (s) { s.classList.toggle('is-current', s === scent); });
    page.setAttribute('data-tone', scent ? scent.getAttribute('data-tone') : 'cream');
    dots.classList.toggle('is-on', !!scent);
    dots.querySelectorAll('[data-dot]').forEach(function (d) {
      d.setAttribute('aria-current', String(!!scent && d.getAttribute('data-dot') === scent.id));
    });
  }
  var visible = {};
  var scentIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
    var current = null;
    scents.forEach(function (s) { if (visible[s.id]) current = current || s; });
    setCurrent(current);
  }, { rootMargin: '-50% 0px -50% 0px' });
  scents.forEach(function (s) { scentIO.observe(s); });
})();

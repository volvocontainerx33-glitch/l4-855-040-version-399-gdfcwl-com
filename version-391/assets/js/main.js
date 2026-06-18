(function () {
  var menuButton = document.querySelector('[data-mobile-menu]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
    var index = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var target = parseInt(dot.getAttribute('data-hero-target'), 10) || 0;
        showSlide(target);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var section = panel.nextElementSibling;
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function filterCards() {
      var keyword = valueOf(input);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
        var keywordMatched = !keyword || title.indexOf(keyword) > -1 || tags.indexOf(keyword) > -1 || cardRegion.indexOf(keyword) > -1 || cardType.indexOf(keyword) > -1 || cardYear.indexOf(keyword) > -1;
        var regionMatched = !regionValue || cardRegion === regionValue;
        var typeMatched = !typeValue || cardType === typeValue;
        var yearMatched = !yearValue || cardYear === yearValue;
        card.classList.toggle('is-hidden', !(keywordMatched && regionMatched && typeMatched && yearMatched));
      });
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', filterCards);
        element.addEventListener('change', filterCards);
      }
    });
  });
})();

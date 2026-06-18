(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var sliders = document.querySelectorAll('[data-hero-slider]');

    sliders.forEach(function (slider) {
      var track = slider.querySelector('[data-hero-track]');
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function render() {
        if (!track) {
          return;
        }

        track.style.transform = 'translateX(-' + index * 100 + '%)';

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function go(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;
        render();
      }

      function play() {
        stop();
        timer = window.setInterval(function () {
          go(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          go(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          go(index + 1);
          play();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          go(dotIndex);
          play();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', play);
      render();
      play();
    });
  }

  function textMatches(haystack, needle) {
    return String(haystack || '').toLowerCase().indexOf(String(needle || '').toLowerCase()) !== -1;
  }

  function setupFilters() {
    var forms = document.querySelectorAll('[data-filter-form]');

    forms.forEach(function (form) {
      var scopeSelector = form.getAttribute('data-filter-target') || 'body';
      var scope = document.querySelector(scopeSelector);
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.filter-card')) : [];
      var empty = document.querySelector(form.getAttribute('data-filter-empty') || '');
      var inputs = Array.prototype.slice.call(form.querySelectorAll('input, select'));

      function apply() {
        var keyword = (form.querySelector('[name="keyword"]') || {}).value || '';
        var region = (form.querySelector('[name="region"]') || {}).value || '';
        var year = (form.querySelector('[name="year"]') || {}).value || '';
        var shown = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre')
          ].join(' ');
          var ok = true;

          if (keyword && !textMatches(text, keyword)) {
            ok = false;
          }

          if (region && card.getAttribute('data-region') !== region) {
            ok = false;
          }

          if (year && card.getAttribute('data-year') !== year) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.style.display = shown ? 'none' : 'block';
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });

      inputs.forEach(function (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      });

      apply();
    });
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var source = player.getAttribute('data-src');
      var button = player.querySelector('[data-play-button]');
      var overlay = player.querySelector('[data-player-overlay]');
      var attached = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function attachAndPlay() {
        function start() {
          var result = video.play();

          if (result && typeof result.catch === 'function') {
            result.catch(function () {});
          }
        }

        if (attached) {
          start();
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          attached = true;
          start();
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              attached = true;
              start();
            });
          } else {
            video.src = source;
            attached = true;
            start();
          }
        });
      }

      function togglePlay(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        if (video.paused) {
          attachAndPlay();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', togglePlay);
      }

      if (overlay) {
        overlay.addEventListener('click', togglePlay);
      }

      video.addEventListener('click', togglePlay);

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-search-page]');

    if (!root || !window.MOVIE_INDEX) {
      return;
    }

    var form = root.querySelector('[data-search-form]');
    var input = root.querySelector('[name="q"]');
    var category = root.querySelector('[name="category"]');
    var year = root.querySelector('[name="year"]');
    var region = root.querySelector('[name="region"]');
    var results = root.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function createCard(movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = [
        '<a class="movie-card-link" href="' + movie.file + '">',
        '<span class="poster-wrap">',
        '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '<span class="card-badge left">' + movie.category + '</span>',
        '<span class="card-badge right">' + movie.year + '</span>',
        '</span>',
        '<span class="card-body">',
        '<strong>' + movie.title + '</strong>',
        '<span>' + movie.region + ' · ' + movie.type + '</span>',
        '<em>' + movie.oneLine + '</em>',
        '</span>',
        '</a>'
      ].join('');
      return article;
    }

    function apply() {
      var keyword = (input && input.value || '').trim().toLowerCase();
      var catValue = category && category.value || '';
      var yearValue = year && year.value || '';
      var regionValue = region && region.value || '';
      var matches = window.MOVIE_INDEX.filter(function (movie) {
        var searchable = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.category].join(' ').toLowerCase();

        if (keyword && searchable.indexOf(keyword) === -1) {
          return false;
        }

        if (catValue && movie.categorySlug !== catValue) {
          return false;
        }

        if (yearValue && String(movie.year) !== yearValue) {
          return false;
        }

        if (regionValue && movie.region !== regionValue) {
          return false;
        }

        return true;
      }).slice(0, 120);

      results.innerHTML = '';

      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'filter-empty';
        empty.style.display = 'block';
        empty.textContent = '没有找到匹配影片';
        results.appendChild(empty);
        return;
      }

      matches.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    }

    [input, category, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
})();

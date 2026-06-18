(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    function showSlide(index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-search]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var countNode = filterRoot.querySelector('[data-filter-count]');
    var emptyNode = filterRoot.querySelector('[data-filter-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var initialYear = params.get('year') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }
    if (yearSelect && initialYear) {
      yearSelect.value = initialYear;
    }

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var content = normalize(card.getAttribute('data-search'));
        var ok = true;
        if (query && content.indexOf(query) === -1) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = visible;
      }
      if (emptyNode) {
        emptyNode.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play-cover]');
    var message = player.querySelector('[data-player-message]');
    var started = false;

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('show');
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('hidden');
      }
    }

    function start() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        setMessage('视频暂时无法加载');
        return;
      }
      hideCover();
      if (!started) {
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后再试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          setMessage('视频暂时无法加载');
          return;
        }
      }
      var playAction = video.play();
      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {
          setMessage('请再次点击播放');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    }
  });
})();

(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    var hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = document.querySelector(panel.getAttribute("data-target"));
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var input = panel.querySelector("[data-filter-text]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var empty = document.querySelector(panel.getAttribute("data-empty"));
      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }
      function run() {
        var query = normalize(input ? input.value : "");
        var yearValue = normalize(year ? year.value : "");
        var regionValue = normalize(region ? region.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search-text"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      [input, year, region].forEach(function (node) {
        if (node) {
          node.addEventListener("input", run);
          node.addEventListener("change", run);
        }
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      run();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var source = video ? video.querySelector("source") : null;
      var overlay = shell.querySelector("[data-play-button]");
      var message = shell.querySelector("[data-video-message]");
      var hls = null;
      var loaded = false;
      if (!video || !source || !overlay) {
        return;
      }
      var url = source.getAttribute("src");
      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
      }
      function bind() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showMessage("视频暂时无法播放，请稍后重试");
            }
          });
          return;
        }
        video.src = url;
      }
      function play() {
        bind();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            showMessage("点击视频控件开始播放");
          });
        }
      }
      overlay.addEventListener("click", function () {
        play();
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle("is-visible", window.scrollY > 420);
    }
    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
    initBackTop();
  });
})();

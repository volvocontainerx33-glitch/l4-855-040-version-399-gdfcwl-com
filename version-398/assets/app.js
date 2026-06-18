document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mainNav = document.querySelector("[data-main-nav]");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.opacity = "0";
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll("[data-search-input]").forEach(function (input) {
    var list = document.querySelector(input.getAttribute("data-search-input"));
    var empty = document.querySelector(input.getAttribute("data-empty-target"));

    input.addEventListener("input", function () {
      if (!list) {
        return;
      }

      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      list.querySelectorAll(".movie-card, .rank-card").forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    });
  });

  document.querySelectorAll(".watch-player").forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".play-button");
    var errorBox = player.parentElement.querySelector(".player-error");
    var source = player.getAttribute("data-hls");
    var loaded = false;

    function setError(message) {
      if (errorBox) {
        errorBox.textContent = message;
      }
    }

    function loadVideo() {
      if (!video || !source || loaded) {
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError("视频暂时无法播放，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        setError("当前浏览器暂时无法播放该视频");
      }
    }

    function playVideo() {
      loadVideo();
      if (!video) {
        return;
      }

      video.controls = true;
      var attempt = video.play();
      player.classList.add("is-playing");

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          setError("视频暂时无法播放，请稍后重试");
          player.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    player.addEventListener("click", function () {
      playVideo();
    });
  });
});

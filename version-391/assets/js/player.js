var MoviePlayer = (function () {
  function init(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var ready = false;

    if (!video || !button || !source) {
      return;
    }

    function markPlaying() {
      button.classList.add('is-hidden');
    }

    function markPaused() {
      if (video.paused && !video.ended) {
        button.classList.remove('is-hidden');
      }
    }

    function playVideo() {
      var played = video.play();
      if (played && typeof played.catch === 'function') {
        played.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    function attachSource() {
      if (ready) {
        playVideo();
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        ready = true;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = source;
            ready = true;
          }
        });
        return;
      }

      video.src = source;
      ready = true;
      playVideo();
    }

    button.addEventListener('click', function () {
      markPlaying();
      attachSource();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        markPlaying();
        attachSource();
      }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', markPaused);
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
  }

  return {
    init: init
  };
})();

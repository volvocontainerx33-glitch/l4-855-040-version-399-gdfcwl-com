function initMoviePlayer(source) {
    var root = document.querySelector("[data-player]");
    if (!root) {
        return;
    }
    var video = root.querySelector("video");
    var cover = root.querySelector("[data-cover]");
    var playButton = root.querySelector("[data-play]");
    var error = root.querySelector("[data-player-error]");
    var hls = null;

    function showError(message) {
        if (error) {
            error.textContent = message;
        }
    }

    function prepare() {
        if (!video || video.getAttribute("data-ready") === "1") {
            return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showError("播放暂时无法加载");
                }
            });
            return;
        }
        showError("播放暂时无法加载");
    }

    function start() {
        prepare();
        if (!video) {
            return;
        }
        var action = video.play();
        if (action && typeof action.then === "function") {
            action.catch(function () {
                showError("请再次点击播放");
            });
        }
    }

    if (playButton) {
        playButton.addEventListener("click", start);
    }
    if (cover && cover !== playButton) {
        cover.addEventListener("click", start);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("hide");
            }
        });
        video.addEventListener("pause", function () {
            if (cover && !video.ended) {
                cover.classList.remove("hide");
            }
        });
        video.addEventListener("ended", function () {
            if (cover) {
                cover.classList.remove("hide");
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll(".site-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "search.html";
                if (value) {
                    window.location.href = target + "?q=" + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector(".hero-carousel");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var target = Number(dot.getAttribute("data-slide-target") || 0);
                show(target);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var area = document.querySelector("[data-search-area]");
        if (!area) {
            return;
        }
        var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
        var controls = Array.prototype.slice.call(area.querySelectorAll(".filter-control"));
        var empty = area.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var keywordInput = area.querySelector("[data-filter='keyword']");
        if (keywordInput && query) {
            keywordInput.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var type = normalize(getValue("type"));
            var year = normalize(getValue("year"));
            var category = normalize(getValue("category"));
            var shown = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var ok = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    ok = false;
                }
                if (year && cardYear !== year) {
                    ok = false;
                }
                if (category && cardCategory !== category) {
                    ok = false;
                }

                card.hidden = !ok;
                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        function getValue(name) {
            var control = area.querySelector("[data-filter='" + name + "']");
            return control ? control.value : "";
        }

        controls.forEach(function (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        apply();
    }

    function setupPlayers() {
        var players = document.querySelectorAll(".movie-player");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var message = player.querySelector(".player-message");
            var source = player.getAttribute("data-video-src");
            var hls = null;
            var initialized = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function init() {
                if (!video || !source || initialized) {
                    return;
                }
                initialized = true;
                setMessage("");

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                setMessage("网络连接异常，正在重新加载");
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                setMessage("视频加载异常，正在恢复");
                                hls.recoverMediaError();
                            } else {
                                setMessage("播放器初始化失败，请稍后重试");
                                hls.destroy();
                            }
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    setMessage("当前环境无法播放该视频");
                }
            }

            function play() {
                init();
                if (!video) {
                    return;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setMessage("点击视频区域后即可播放");
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", function () {
                    play();
                });
            }
            if (video) {
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                    setMessage("");
                });
                video.addEventListener("pause", function () {
                    if (overlay && video.currentTime === 0) {
                        overlay.classList.remove("is-hidden");
                    }
                });
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroCarousel();
        setupFilters();
        setupPlayers();
    });
})();

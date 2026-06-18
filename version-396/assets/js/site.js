(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
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
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        if (!inputs.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var incoming = params.get("q") || "";

        inputs.forEach(function (input) {
            if (input.hasAttribute("data-query-sync") && incoming) {
                input.value = incoming;
            }
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            var empty = document.querySelector("[data-empty]");

            function apply() {
                var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-meta") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    var match = words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                    card.style.display = match ? "" : "none";
                    if (match) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }

            input.addEventListener("input", apply);
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();

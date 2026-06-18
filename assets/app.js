(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

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

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var yearSelect = document.querySelector("[data-year-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
  var empty = document.querySelector(".search-empty");

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(filterInput ? filterInput.value : "");
    var selectedYear = yearSelect ? yearSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year")
      ].join(" "));
      var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var shouldShow = yearMatch && keywordMatch;

      card.style.display = shouldShow ? "" : "none";

      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    filterInput.addEventListener("input", applyFilter);
  }

  if (yearSelect) {
    yearSelect.addEventListener("change", applyFilter);
  }

  applyFilter();
})();

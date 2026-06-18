(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  const nextButton = document.querySelector("[data-hero-next]");
  const prevButton = document.querySelector("[data-hero-prev]");
  let activeSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("active", current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("active", current === activeSlide);
    });
  }

  function queueSlide() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      queueSlide();
    });
  });

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      showSlide(activeSlide + 1);
      queueSlide();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      showSlide(activeSlide - 1);
      queueSlide();
    });
  }

  showSlide(0);
  queueSlide();

  const searchInputs = Array.from(document.querySelectorAll(".movie-search"));
  const filterButtons = Array.from(document.querySelectorAll(".filter-pill"));
  let activeFilter = "all";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applySearch() {
    const query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).find(Boolean) || "");
    const cards = Array.from(document.querySelectorAll(".searchable-grid .movie-card, .searchable-grid .ranking-card"));

    cards.forEach(function (card) {
      const haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.textContent
      ].join(" "));
      const byText = !query || haystack.includes(query);
      const byFilter = activeFilter === "all" || haystack.includes(normalize(activeFilter));
      card.hidden = !(byText && byFilter);
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applySearch);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applySearch();
    });
  });
}());

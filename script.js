(() => {
  const root = document.documentElement;
  const themeSelect = document.querySelector("#theme-select");
  const themeControl = document.querySelector("[data-theme-control]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  const currentYear = document.querySelector("[data-current-year]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkPreference = window.matchMedia("(prefers-color-scheme: dark)");
  const themes = ["system", "light", "dark"];

  const getSavedTheme = () => {
    try {
      return localStorage.getItem("liju-theme") || "system";
    } catch {
      return "system";
    }
  };

  const updateThemeColor = () => {
    const isDark =
      root.dataset.theme === "dark" ||
      (root.dataset.theme === "system" && darkPreference.matches);
    themeMeta?.setAttribute("content", isDark ? "#071019" : "#f4f7f6");
  };

  const setTheme = (theme) => {
    const acceptedTheme = themes.includes(theme) ? theme : "system";
    const readableTheme =
      acceptedTheme.charAt(0).toUpperCase() + acceptedTheme.slice(1);
    root.dataset.theme = acceptedTheme;
    if (themeSelect) themeSelect.value = acceptedTheme;
    if (themeLabel) themeLabel.textContent = readableTheme;
    themeControl?.setAttribute(
      "aria-label",
      `Color theme: ${readableTheme.toLowerCase()}. Activate to change theme.`,
    );
    try {
      localStorage.setItem("liju-theme", acceptedTheme);
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
    updateThemeColor();
  };

  setTheme(getSavedTheme());
  themeSelect?.addEventListener("change", (event) =>
    setTheme(event.target.value),
  );
  themeControl?.addEventListener("click", () => {
    const currentIndex = themes.indexOf(root.dataset.theme || "system");
    setTheme(themes[(currentIndex + 1) % themes.length]);
  });
  darkPreference.addEventListener("change", updateThemeColor);

  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    navLinks?.classList.remove("is-open");
    header?.classList.remove("is-menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    navLinks?.classList.toggle("is-open", willOpen);
    header?.classList.toggle("is-menu-open", willOpen);
  });

  navLinks?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-nav")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const updateHeader = () =>
    header?.classList.toggle("is-scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5%" },
    );
    reveals.forEach((item) => revealObserver.observe(item));
  }

  const sectionLinks = [
    ...document.querySelectorAll('.nav-links a[href^="#"]'),
  ];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleSection) return;
        sectionLinks.forEach((link) => {
          const isActive =
            link.getAttribute("href") === `#${visibleSection.target.id}`;
          if (isActive) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.3, 0.7] },
    );
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const fullPageSections = [...document.querySelectorAll("main > section")];
  if ("IntersectionObserver" in window) {
    const activeSectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.target.classList.toggle("is-active", entry.isIntersecting),
        );
      },
      { threshold: 0.45 },
    );
    fullPageSections.forEach((section) => activeSectionObserver.observe(section));
  } else {
    fullPageSections.forEach((section) => section.classList.add("is-active"));
  }

  const projectSlider = document.querySelector("[data-project-slider]");
  const projectCards = projectSlider
    ? [...projectSlider.querySelectorAll(".case-study")]
    : [];
  const previousProject = document.querySelector("[data-slider-prev]");
  const nextProject = document.querySelector("[data-slider-next]");
  const sliderStatus = document.querySelector("[data-slider-status]");
  let activeProject = 0;
  let scrollFrame = 0;

  const updateProjectControls = (index) => {
    activeProject = Math.max(0, Math.min(index, projectCards.length - 1));
    if (sliderStatus) {
      sliderStatus.textContent = `Project ${activeProject + 1} of ${projectCards.length}`;
    }
    if (previousProject) previousProject.disabled = activeProject === 0;
    if (nextProject) nextProject.disabled = activeProject === projectCards.length - 1;
  };

  const showProject = (index) => {
    const card = projectCards[index];
    if (!projectSlider || !card) return;
    projectSlider.scrollTo({
      left: card.offsetLeft - projectSlider.offsetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
    updateProjectControls(index);
  };

  previousProject?.addEventListener("click", () => showProject(activeProject - 1));
  nextProject?.addEventListener("click", () => showProject(activeProject + 1));

  projectSlider?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showProject(activeProject - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showProject(activeProject + 1);
    }
  });

  projectSlider?.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const nearestIndex = projectCards.reduce((nearest, card, index) => {
          const currentDistance = Math.abs(
            card.offsetLeft - projectSlider.offsetLeft - projectSlider.scrollLeft,
          );
          const nearestCard = projectCards[nearest];
          const nearestDistance = Math.abs(
            nearestCard.offsetLeft -
              projectSlider.offsetLeft -
              projectSlider.scrollLeft,
          );
          return currentDistance < nearestDistance ? index : nearest;
        }, 0);
        updateProjectControls(nearestIndex);
      });
    },
    { passive: true },
  );

  updateProjectControls(0);

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();

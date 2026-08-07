(() => {
  const root = document.documentElement;
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
    themeMeta?.setAttribute("content", isDark ? "#12110f" : "#f4f1ea");
  };

  const setTheme = (theme) => {
    const acceptedTheme = themes.includes(theme) ? theme : "system";
    const readableTheme =
      acceptedTheme.charAt(0).toUpperCase() + acceptedTheme.slice(1);
    root.dataset.theme = acceptedTheme;
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

  const projects = [...document.querySelectorAll("details.project")];
  projects.forEach((project) => {
    project.addEventListener("toggle", () => {
      if (!project.open) return;
      projects.forEach((otherProject) => {
        if (otherProject !== project) otherProject.open = false;
      });
    });
  });

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();

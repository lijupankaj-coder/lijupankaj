(() => {
  "use strict";

  const projects = Array.isArray(window.portfolioProjects) ? window.portfolioProjects : [];
  const grid = document.querySelector("#project-grid");
  const count = document.querySelector("#project-count");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const dialog = document.querySelector("#project-dialog");
  const dialogContent = document.querySelector("#dialog-content");
  let activeTrigger = null;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const projectCard = (project, index) => {
    const image = project.images[0];
    const wide = index % 5 === 0 ? " project-card--wide" : "";
    const loading = index < 2 ? "eager" : "lazy";

    return `
      <article class="project-card${wide}">
        <button class="project-trigger" type="button" data-project="${escapeHtml(project.id)}" aria-label="View ${escapeHtml(project.title)} project details">
          <figure class="project-visual">
            <img src="${escapeHtml(image.src)}" width="${image.width}" height="${image.height}" alt="${escapeHtml(image.alt)}" loading="${loading}" decoding="async">
            <span class="project-open" aria-hidden="true">↗</span>
          </figure>
          <div class="project-meta"><span>${escapeHtml(project.primary)}</span><span>${escapeHtml(project.year)}</span></div>
          <h3>${escapeHtml(project.title)}</h3>
          <p class="project-summary">${escapeHtml(project.overview)}</p>
        </button>
      </article>`;
  };

  const visibleProjects = (filter) => {
    if (filter === "featured") return projects.filter((project) => project.featured);
    if (filter === "all") return projects;
    return projects.filter((project) => project.categories.includes(filter));
  };

  const renderProjects = (filter = "featured") => {
    if (!grid) return;
    const selection = visibleProjects(filter);
    grid.innerHTML = selection.map(projectCard).join("");
    count.textContent = `${selection.length} project${selection.length === 1 ? "" : "s"}`;

    grid.querySelectorAll("[data-project]").forEach((trigger) => {
      trigger.addEventListener("click", () => openProject(trigger.dataset.project, trigger));
    });
  };

  const dialogMarkup = (project) => `
    <header class="dialog-heading">
      <p class="dialog-kicker">${escapeHtml(project.primary)} · ${escapeHtml(project.year)}</p>
      <h2 id="dialog-title">${escapeHtml(project.title)}</h2>
    </header>
    <div class="dialog-info">
      <div class="dialog-copy">
        <p>${escapeHtml(project.overview)}</p>
        <p><strong>Contribution:</strong> ${escapeHtml(project.role)}</p>
      </div>
      <div class="dialog-deliverables">
        <h3>Selected deliverables</h3>
        <ul>${project.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="dialog-gallery">
      ${project.images.map((image, index) => `
        <figure>
          <img src="${escapeHtml(image.src)}" width="${image.width}" height="${image.height}" alt="${escapeHtml(image.alt)}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
        </figure>`).join("")}
    </div>`;

  function openProject(id, trigger = null) {
    const project = projects.find((item) => item.id === id);
    if (!project || !dialog || !dialogContent) return;
    activeTrigger = trigger || document.activeElement;
    dialogContent.innerHTML = dialogMarkup(project);
    document.body.classList.add("dialog-open");
    dialog.showModal();
    history.replaceState(null, "", `${location.pathname}${location.search}#project=${project.id}`);
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderProjects(button.dataset.filter);
    });
  });

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      history.replaceState(null, "", `${location.pathname}${location.search}#work`);
      if (activeTrigger instanceof HTMLElement) activeTrigger.focus({ preventScroll: true });
      activeTrigger = null;
    });
  }

  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];

  const closeMenu = () => {
    header?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
    const label = menuButton?.querySelector(".sr-only");
    if (label) label.textContent = "Open navigation";
  };

  menuButton?.addEventListener("click", () => {
    const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
    header?.classList.toggle("is-open", willOpen);
    menuButton.setAttribute("aria-expanded", String(willOpen));
    const label = menuButton.querySelector(".sr-only");
    if (label) label.textContent = willOpen ? "Close navigation" : "Open navigation";
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header?.classList.contains("is-open")) {
      closeMenu();
      menuButton?.focus();
    }
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-30% 0px -60%", threshold: 0 });

  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  renderProjects();

  const hashProject = location.hash.match(/^#project=([a-z0-9-]+)$/i)?.[1];
  if (hashProject) requestAnimationFrame(() => openProject(hashProject));
})();

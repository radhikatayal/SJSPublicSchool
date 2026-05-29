(function () {
  const schoolData = window.schoolData;
  let revealObserver = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    if (!schoolData) {
      return;
    }

    renderShell();
    syncHeaderHeight();
    setupMotion();
    setupHeroGallery();
    renderHome();
    renderAcademics();
    renderCbseInfo();
    renderAdmissions();
    renderFaculty();
    renderLocation();
    setupEnquiryForm();
  }

  function renderShell() {
    const page = document.body.dataset.page || "home";
    const headerNavItems = [
      { href: "index.html", label: "Home", matchPages: ["home"] },
      { href: "about-us.html", label: "About Us", matchPages: ["about"] },
      { href: "academics.html", label: "Academics", matchPages: ["academics", "admissions", "faculty"] },
      { href: "cbse-info.html", label: "CBSE Info", matchPages: ["cbse"] },
      { href: "cbse-result.html", label: "CBSE Result", matchPages: ["cbse-result"] },
      { href: "gallery.html", label: "Gallery", matchPages: ["gallery"] }
    ];

    const footerNavItems = [
      { key: "home", href: "index.html", label: "Home" },
      { key: "about", href: "about-us.html", label: "About Us" },
      { key: "academics", href: "academics.html", label: "Academics" },
      { key: "cbse", href: "cbse-info.html", label: "CBSE Info" },
      { key: "gallery", href: "gallery.html", label: "Gallery" },
      { key: "faculty", href: "faculty.html", label: "Faculty" },
      { key: "location", href: "location.html", label: "Location" }
    ];

    const headerMount = document.querySelector("[data-site-header]");
    const footerMount = document.querySelector("[data-site-footer]");

    if (headerMount) {
      headerMount.innerHTML = `
        <a class="skip-link" href="#main-content">Skip to content</a>
        <header class="site-header">
          <div class="header-inner">
            <a class="brand" href="index.html" aria-label="${escapeHtml(schoolData.siteName)} home page">
              <span class="brand-mark">
                <img src="assets/images/sjs-logo.png" alt="S. J. S. Public School logo">
              </span>
              <span class="brand-text">
                <span class="brand-title">${escapeHtml(schoolData.siteName)}</span>
                <span class="brand-affiliation">
                  Affiliation No: ${escapeHtml(schoolData.contact.affiliationNumber)}
                </span>
                <span class="brand-subtitle">${escapeHtml(schoolData.locationName)}</span>
              </span>
            </a>

            <button
              class="nav-toggle"
              type="button"
              data-nav-toggle
              aria-expanded="false"
              aria-controls="site-navigation"
              aria-label="Toggle navigation"
            >
              Menu
            </button>

            <nav class="site-nav" id="site-navigation" data-nav-panel>
              <ul class="nav-list">
                ${headerNavItems
                  .map(
                    (item) => `
                      <li>
                        <a
                          class="nav-link ${(item.matchPages || []).includes(page) ? "is-current" : ""}"
                          href="${item.href}"
                          ${(item.matchPages || []).includes(page) ? 'aria-current="page"' : ""}
                        >
                          ${item.label}
                        </a>
                      </li>
                    `
                  )
                  .join("")}
              </ul>
              <a class="button button--secondary" href="enquiry.html">Enquire Now</a>
            </nav>
          </div>
        </header>
      `;
    }

    if (footerMount) {
      footerMount.innerHTML = `
        <footer class="site-footer">
          <div class="footer-inner">
            <div class="footer-grid">
              <section>
                <p class="eyebrow">S. J. S. Public School</p>
                <p>
                  A welcoming school website for parents, students, and visitors to explore
                  admissions, faculty, contact details, and campus information.
                </p>
              </section>

              <section>
                <p class="eyebrow">Quick Links</p>
                <ul class="footer-links">
                  ${footerNavItems
                    .map(
                      (item) => `
                        <li><a href="${item.href}">${item.label}</a></li>
                      `
                    )
                    .join("")}
                </ul>
              </section>

              <section>
                <p class="eyebrow">Contact</p>
                <ul class="footer-contact">
                  <li>${escapeHtml(schoolData.contact.address)}</li>
                  <li>${escapeHtml(schoolData.contact.phone)}</li>
                  <li>${escapeHtml(schoolData.contact.email)}</li>
                  <li>Affiliation No. ${escapeHtml(schoolData.contact.affiliationNumber)}</li>
                </ul>
              </section>
            </div>

            <p class="footer-credit">
              Copyright <span data-current-year></span> ${escapeHtml(
                schoolData.siteName
              )}. All rights reserved.
            </p>
          </div>
        </footer>
      `;
    }

    document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });

    setupMobileNav();
  }

  function setupMobileNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector("[data-nav-toggle]");
    const navPanel = document.querySelector("[data-nav-panel]");

    if (!header || !toggle || !navPanel) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isOpen = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    navPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", syncHeaderHeight);
  }

  function syncHeaderHeight() {
    const header = document.querySelector(".site-header");
    const headerHeight = header ? header.offsetHeight : 90;
    document.documentElement.style.setProperty("--site-header-height", `${headerHeight}px`);
  }

  function setupMotion() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      document.querySelectorAll("[data-reveal]").forEach((node) => node.classList.add("is-visible"));
      return;
    }

    document.body.classList.add("has-motion");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach((node) => node.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16
      }
    );

    observeReveals(document);
  }

  function setupHeroGallery() {
    document.querySelectorAll("[data-hero-gallery]").forEach((gallery) => {
      const slides = Array.from(gallery.querySelectorAll("[data-gallery-slide]"));
      const prevButton = gallery.querySelector("[data-gallery-prev]");
      const nextButton = gallery.querySelector("[data-gallery-next]");

      if (slides.length < 2 || !prevButton || !nextButton) {
        return;
      }

      let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
      if (activeIndex < 0) {
        activeIndex = 0;
      }

      const showSlide = (nextIndex) => {
        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
          const isActive = index === activeIndex;
          slide.classList.toggle("is-active", isActive);
          slide.hidden = !isActive;
          slide.setAttribute("aria-hidden", String(!isActive));
        });
      };

      prevButton.addEventListener("click", () => {
        showSlide(activeIndex - 1);
      });

      nextButton.addEventListener("click", () => {
        showSlide(activeIndex + 1);
      });

      showSlide(activeIndex);
    });
  }

  function observeReveals(scope) {
    const revealNodes = scope.querySelectorAll("[data-reveal]");
    revealNodes.forEach((node) => {
      if (revealObserver) {
        revealObserver.observe(node);
      } else {
        node.classList.add("is-visible");
      }
    });
  }

  function renderHome() {
    renderCards("#home-stats", schoolData.stats, (item) => {
      return `
        <article class="kpi-card" data-reveal>
          <p class="kpi-value">${escapeHtml(item.value)}</p>
          <h3>${escapeHtml(item.label)}</h3>
        </article>
      `;
    });

    renderAboutTabs();

    renderCards("#home-pillars", schoolData.homePillars, (item) => {
      return `
        <article class="feature-card" data-reveal>
          <p class="eyebrow">Highlight</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `;
    });

    renderCards("#home-admission-steps", schoolData.admissionSteps, (item, index) => {
      return `
        <article class="step-card" data-step="${index + 1}" data-reveal>
          <h3>Step ${index + 1}</h3>
          <p>${escapeHtml(item)}</p>
        </article>
      `;
    });

    renderCards("#home-leadership", schoolData.leadership, (item) => {
      return `
        <article class="leader-card" data-reveal>
          <p class="staff-role">${escapeHtml(item.homeRole || item.role)}</p>
          <h3>${escapeHtml(item.homeDisplayName || item.name)}</h3>
          <p>${escapeHtml(item.homeDisplayQualification || item.qualification)}</p>
        </article>
      `;
    });
  }

  function renderAboutTabs() {
    const mount = document.getElementById("about-tabs");
    const tabs = Array.isArray(schoolData.aboutTabs) ? schoolData.aboutTabs : [];
    if (!mount || tabs.length === 0) {
      return;
    }

    const tabItems = tabs.map((item, index) => ({
      ...item,
      key: item.id || `about-${index}`
    }));

    mount.innerHTML = `
      <div class="about-tabs__nav" role="tablist" aria-label="About Us tabs">
        ${tabItems
          .map(
            (item, index) => `
              <a
                class="about-tabs__tab ${index === 0 ? "is-active" : ""}"
                href="#${item.key}"
                role="tab"
                id="about-tab-${item.key}"
                aria-selected="${index === 0 ? "true" : "false"}"
                aria-controls="about-panel-view"
                tabindex="${index === 0 ? "0" : "-1"}"
                data-about-tab="${index}"
              >
                ${escapeHtml(item.title)}
              </a>
            `
          )
          .join("")}
      </div>
      <div class="about-tabs__panels">
        <section
          class="about-panel"
          id="about-panel-view"
          role="tabpanel"
          aria-labelledby="about-tab-${tabItems[0].key}"
        ></section>
      </div>
    `;

    const buttonNodes = Array.from(mount.querySelectorAll("[data-about-tab]"));
    const panelView = mount.querySelector("#about-panel-view");
    const initialHash = window.location.hash.replace("#", "");
    const initialIndex = tabItems.findIndex((item) => item.key === initialHash);

    if (!panelView) {
      return;
    }

    const renderPanel = (item) => {
      panelView.innerHTML = `
        <div class="about-panel__content">
          <p class="eyebrow">About Us</p>
          <h3>${escapeHtml(item.title)}</h3>
          ${item.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
        <aside class="about-panel__media">
          <img src="${item.image}" alt="${escapeHtml(item.alt)}">
        </aside>
      `;
    };

    const setActiveTab = (nextIndex, options = {}) => {
      const { updateHash = true } = options;
      buttonNodes.forEach((button, index) => {
        const isActive = index === nextIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });

      const activeItem = tabItems[nextIndex];
      renderPanel(activeItem);
      panelView.setAttribute("aria-labelledby", `about-tab-${activeItem.key}`);

      const nextHash = activeItem?.key;
      if (updateHash && nextHash && window.location.hash !== `#${nextHash}`) {
        window.history.replaceState(null, "", `#${nextHash}`);
      }
    };

    buttonNodes.forEach((button, index) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveTab(index);
      });

      button.addEventListener("keydown", (event) => {
        let targetIndex = index;

        if (event.key === "ArrowRight") {
          targetIndex = (index + 1) % buttonNodes.length;
        } else if (event.key === "ArrowLeft") {
          targetIndex = (index - 1 + buttonNodes.length) % buttonNodes.length;
        } else if (event.key === "ArrowDown") {
          targetIndex = (index + 1) % buttonNodes.length;
        } else if (event.key === "ArrowUp") {
          targetIndex = (index - 1 + buttonNodes.length) % buttonNodes.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = buttonNodes.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        setActiveTab(targetIndex);
        buttonNodes[targetIndex].focus();
      });
    });

    window.addEventListener("hashchange", () => {
      const nextHash = window.location.hash.replace("#", "");
      const nextIndex = tabItems.findIndex((item) => item.key === nextHash);
      if (nextIndex >= 0) {
        setActiveTab(nextIndex, { updateHash: false });
      }
    });

    setActiveTab(initialIndex >= 0 ? initialIndex : 0, { updateHash: true });
  }

  function getButtonClassName(variant) {
    if (variant === "secondary") {
      return "button button--secondary";
    }

    if (variant === "ghost") {
      return "button button--ghost";
    }

    return "button";
  }

  function renderPanelParagraphs(paragraphs) {
    if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
      return "";
    }

    return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  }

  function renderPanelDetails(details) {
    if (!Array.isArray(details) || details.length === 0) {
      return "";
    }

    return `
      <ul class="detail-list detail-list--plain academics-detail-list">
        ${details
          .map(
            (item) => `
              <li>
                <strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  }

  function renderPanelTable(table) {
    if (
      !table ||
      !Array.isArray(table.columns) ||
      table.columns.length === 0 ||
      !Array.isArray(table.rows) ||
      table.rows.length === 0
    ) {
      return "";
    }

    return `
      <div class="table-shell academics-table">
        <table>
          <thead>
            <tr>
              ${table.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${table.rows
              .map(
                (row) => `
                  <tr>
                    ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPanelActions(actions) {
    if (!Array.isArray(actions) || actions.length === 0) {
      return "";
    }

    return `
      <div class="button-row academics-actions">
        ${actions
          .map((action) => {
            const target = action.newTab ? ' target="_blank" rel="noreferrer"' : "";
            return `
              <a class="${getButtonClassName(action.variant)}" href="${escapeHtml(action.href)}"${target}>
                ${escapeHtml(action.label)}
              </a>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderAcademicsSubTabs(mount, parentTab) {
    const subTabs = Array.isArray(parentTab.subTabs) ? parentTab.subTabs : [];
    if (!mount || subTabs.length === 0) {
      return;
    }

    const tabItems = subTabs.map((item, index) => ({
      ...item,
      key: item.id || `${parentTab.key}-sub-${index}`
    }));

    mount.innerHTML = `
      <div class="academics-subtabs__nav" role="tablist" aria-label="${escapeHtml(parentTab.title)} tabs">
        ${tabItems
          .map(
            (item, index) => `
              <a
                class="academics-subtabs__tab ${index === 0 ? "is-active" : ""}"
                href="#${item.key}"
                role="tab"
                id="academics-subtab-${item.key}"
                aria-selected="${index === 0 ? "true" : "false"}"
                aria-controls="academics-subpanel-${parentTab.key}"
                tabindex="${index === 0 ? "0" : "-1"}"
                data-academics-subtab="${index}"
              >
                ${escapeHtml(item.title)}
              </a>
            `
          )
          .join("")}
      </div>
      <section
        class="academics-subtabs__panel"
        id="academics-subpanel-${parentTab.key}"
        role="tabpanel"
        aria-labelledby="academics-subtab-${tabItems[0].key}"
      ></section>
    `;

    const buttonNodes = Array.from(mount.querySelectorAll("[data-academics-subtab]"));
    const panelView = mount.querySelector(`#academics-subpanel-${parentTab.key}`);
    if (!panelView) {
      return;
    }

    const renderSubPanel = (item) => {
      panelView.innerHTML = `
        <h4>${escapeHtml(item.title)}</h4>
        ${renderPanelParagraphs(item.paragraphs)}
        ${renderPanelDetails(item.details)}
        ${renderPanelTable(item.table)}
        ${renderPanelActions(item.actions)}
      `;
    };

    const setActiveTab = (nextIndex) => {
      buttonNodes.forEach((button, index) => {
        const isActive = index === nextIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });

      const activeItem = tabItems[nextIndex];
      renderSubPanel(activeItem);
      panelView.setAttribute("aria-labelledby", `academics-subtab-${activeItem.key}`);
    };

    buttonNodes.forEach((button, index) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveTab(index);
      });

      button.addEventListener("keydown", (event) => {
        let targetIndex = index;

        if (event.key === "ArrowRight") {
          targetIndex = (index + 1) % buttonNodes.length;
        } else if (event.key === "ArrowLeft") {
          targetIndex = (index - 1 + buttonNodes.length) % buttonNodes.length;
        } else if (event.key === "ArrowDown") {
          targetIndex = (index + 1) % buttonNodes.length;
        } else if (event.key === "ArrowUp") {
          targetIndex = (index - 1 + buttonNodes.length) % buttonNodes.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = buttonNodes.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        setActiveTab(targetIndex);
        buttonNodes[targetIndex].focus();
      });
    });

    setActiveTab(0);
  }

  function renderAcademics() {
    const mount = document.getElementById("academics-tabs");
    const tabs = Array.isArray(schoolData.academicsTabs) ? schoolData.academicsTabs : [];
    if (!mount || tabs.length === 0) {
      return;
    }

    const tabItems = tabs.map((item, index) => ({
      ...item,
      key: item.id || `academics-${index}`
    }));

    mount.innerHTML = `
      <div class="about-tabs__nav" role="tablist" aria-label="Academics tabs">
        ${tabItems
          .map(
            (item, index) => `
              <a
                class="about-tabs__tab ${index === 0 ? "is-active" : ""}"
                href="#${item.key}"
                role="tab"
                id="academics-tab-${item.key}"
                aria-selected="${index === 0 ? "true" : "false"}"
                aria-controls="academics-panel-view"
                tabindex="${index === 0 ? "0" : "-1"}"
                data-academics-tab="${index}"
              >
                ${escapeHtml(item.title)}
              </a>
            `
          )
          .join("")}
      </div>
      <div class="about-tabs__panels">
        <section
          class="about-panel academics-panel"
          id="academics-panel-view"
          role="tabpanel"
          aria-labelledby="academics-tab-${tabItems[0].key}"
        ></section>
      </div>
    `;

    const buttonNodes = Array.from(mount.querySelectorAll("[data-academics-tab]"));
    const panelView = mount.querySelector("#academics-panel-view");
    const initialHash = window.location.hash.replace("#", "");
    const initialIndex = tabItems.findIndex((item) => item.key === initialHash);
    const academicCalendarItem =
      tabItems.find((item) => item.key === "academic-calender") || null;

    if (!panelView) {
      return;
    }

    const renderAcademicCalendarShortcut = (activeKey) => {
      if (!academicCalendarItem) {
        return "";
      }

      const isActive = activeKey === academicCalendarItem.key;
      return `
        <a
          class="${isActive ? "button" : "button button--ghost"} academics-panel__calendar-link"
          href="#${academicCalendarItem.key}"
          ${isActive ? 'aria-current="page"' : ""}
        >
          ${escapeHtml(academicCalendarItem.title)}
        </a>
      `;
    };

    const renderPanel = (item) => {
      panelView.innerHTML = `
        <div class="about-panel__content academics-panel__content">
          <div class="academics-panel__top">
            <div class="academics-panel__heading">
              <p class="eyebrow">${escapeHtml(item.eyebrow || "Academics")}</p>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            ${renderAcademicCalendarShortcut(item.key)}
          </div>
          ${renderPanelParagraphs(item.paragraphs)}
          ${renderPanelDetails(item.details)}
          ${renderPanelTable(item.table)}
          <div data-academics-subtabs></div>
          ${renderPanelActions(item.actions)}
        </div>
      `;

      if (Array.isArray(item.subTabs) && item.subTabs.length > 0) {
        const subTabMount = panelView.querySelector("[data-academics-subtabs]");
        renderAcademicsSubTabs(subTabMount, item);
      } else {
        const subTabMount = panelView.querySelector("[data-academics-subtabs]");
        if (subTabMount) {
          subTabMount.remove();
        }
      }
    };

    const setActiveTab = (nextIndex, options = {}) => {
      const { updateHash = true } = options;
      buttonNodes.forEach((button, index) => {
        const isActive = index === nextIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
      });

      const activeItem = tabItems[nextIndex];
      renderPanel(activeItem);
      panelView.setAttribute("aria-labelledby", `academics-tab-${activeItem.key}`);

      const nextHash = activeItem?.key;
      if (updateHash && nextHash && window.location.hash !== `#${nextHash}`) {
        window.history.replaceState(null, "", `#${nextHash}`);
      }
    };

    buttonNodes.forEach((button, index) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveTab(index);
      });

      button.addEventListener("keydown", (event) => {
        let targetIndex = index;

        if (event.key === "ArrowRight") {
          targetIndex = (index + 1) % buttonNodes.length;
        } else if (event.key === "ArrowLeft") {
          targetIndex = (index - 1 + buttonNodes.length) % buttonNodes.length;
        } else if (event.key === "ArrowDown") {
          targetIndex = (index + 1) % buttonNodes.length;
        } else if (event.key === "ArrowUp") {
          targetIndex = (index - 1 + buttonNodes.length) % buttonNodes.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = buttonNodes.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        setActiveTab(targetIndex);
        buttonNodes[targetIndex].focus();
      });
    });

    window.addEventListener("hashchange", () => {
      const nextHash = window.location.hash.replace("#", "");
      const nextIndex = tabItems.findIndex((item) => item.key === nextHash);
      if (nextIndex >= 0) {
        setActiveTab(nextIndex, { updateHash: false });
      }
    });

    setActiveTab(initialIndex >= 0 ? initialIndex : 0, { updateHash: true });
  }

  function createHtmlCell(html) {
    return { html };
  }

  function renderTableCell(cell) {
    if (cell && typeof cell === "object" && Object.prototype.hasOwnProperty.call(cell, "html")) {
      return cell.html;
    }

    return escapeHtml(cell ?? "");
  }

  function renderDisclosureTable(columns, rows) {
    return `
      <div class="table-shell">
        <table>
          <thead>
            <tr>
              ${columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    ${row
                      .map((cell, index) =>
                        index === 0
                          ? `<th scope="row">${renderTableCell(cell)}</th>`
                          : `<td>${renderTableCell(cell)}</td>`
                      )
                      .join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderDisclosureAction(item) {
    if (item.href) {
      const target = item.newTab ? ' target="_blank" rel="noreferrer"' : "";
      return createHtmlCell(
        `<a class="table-link" href="${escapeHtml(item.href)}"${target}>${escapeHtml(
          item.actionLabel || "Open"
        )}</a>`
      );
    }

    return createHtmlCell(
      `<span class="table-status">${escapeHtml(item.status || "Available on request")}</span>`
    );
  }

  function findPersonByRole(role) {
    return (
      schoolData.leadership.find((person) => person.role === role) ||
      schoolData.staffDirectory.find((person) => person.role === role) ||
      null
    );
  }

  function renderCbseInfo() {
    const generalMount = document.getElementById("cbse-general-info");
    const documentsMount = document.getElementById("cbse-documents");
    const academicsMount = document.getElementById("cbse-academics");
    const classXMount = document.getElementById("cbse-results-x");
    const classXiiMount = document.getElementById("cbse-results-xii");
    const staffMount = document.getElementById("cbse-staff");
    const infrastructureMount = document.getElementById("cbse-infrastructure");
    const hasCbseMount = [
      generalMount,
      documentsMount,
      academicsMount,
      classXMount,
      classXiiMount,
      staffMount,
      infrastructureMount
    ].some(Boolean);

    if (!hasCbseMount) {
      return;
    }

    const cbseInfo = schoolData.cbseInfo || {};

    const principal = findPersonByRole("Principal");
    const specialEducator = findPersonByRole("Special Educator");
    const wellnessTeacher = findPersonByRole("Wellness Teacher");
    const totalTeachers = "43";

    const generalRows = [
      ["1.", "Name of the School", schoolData.siteName],
      ["2.", "Affiliation No. (If Applicable)", schoolData.contact.affiliationNumber],
      ["3.", "School Code (If Applicable)", schoolData.contact.schoolCode],
      ["4.", "Complete Address with Pin Code", schoolData.contact.address],
      [
        "5.",
        "Principal's Name & Qualifications",
        principal ? `${principal.name} - ${principal.qualification}` : "Not listed"
      ],
      ["6.", "School E-Mail ID", schoolData.contact.email],
      ["7.", "Contact Details (Landline / Mobile)", `${schoolData.contact.phone}, ${schoolData.contact.alternatePhone}`]
    ];

    generalMount.innerHTML = renderDisclosureTable(["Sl. No.", "Information", "Details"], generalRows);

    if (documentsMount) {
      documentsMount.innerHTML = renderDisclosureTable(
        ["Sl. No.", "Documents and Information", "View"],
        (cbseInfo.documents || []).map((item, index) => [
          `${index + 1}.`,
          item.title,
          renderDisclosureAction(item)
        ])
      );
    }

    if (academicsMount) {
      academicsMount.innerHTML = renderDisclosureTable(
        ["Sl. No.", "Documents and Information", "View"],
        (cbseInfo.academics || []).map((item, index) => [
          `${index + 1}.`,
          item.title,
          renderDisclosureAction(item)
        ])
      );
    }

    if (classXMount) {
      classXMount.innerHTML = renderDisclosureTable(
        ["Sl. No.", "Year", "No. of Students Appeared", "No. of Students Passed", "Pass Percentage", "Remarks"],
        (cbseInfo.resultClassX || []).map((item, index) => [
          `${index + 1}.`,
          item.year,
          item.registered,
          item.passed,
          item.passPercentage,
          item.remarks
        ])
      );
    }

    if (classXiiMount) {
      classXiiMount.innerHTML = renderDisclosureTable(
        ["Sl. No.", "Year", "No. of Students Appeared", "No. of Students Passed", "Pass Percentage", "Remarks"],
        (cbseInfo.resultClassXii || []).map((item, index) => [
          `${index + 1}.`,
          item.year,
          item.registered,
          item.passed,
          item.passPercentage,
          item.remarks
        ])
      );
    }

    if (staffMount) {
      staffMount.innerHTML = renderDisclosureTable(
        ["Sl. No.", "Information", "Details"],
        [
          ["1.", "Principal", principal ? principal.name : "Not listed"],
          ["2.", "Total No. of Teachers", totalTeachers],
          ["3.", "Teachers Section Ratio", "1:1:5"],
          ["4.", "Details of Special Educator", specialEducator ? specialEducator.name : "Available on request"],
          [
            "5.",
            "Details of Counsellor and Wellness Teacher",
            wellnessTeacher ? wellnessTeacher.name : "Available on request"
          ]
        ]
      );
    }

    if (infrastructureMount) {
      infrastructureMount.innerHTML = renderDisclosureTable(
        ["Sl. No.", "Information", "Details"],
        (cbseInfo.infrastructure || []).map((item, index) => [
          `${index + 1}.`,
          item.label,
          item.href ? renderDisclosureAction(item) : item.value
        ])
      );
    }
  }

  function renderAdmissions() {
    const feeTableBody = document.getElementById("fee-table-body");
    if (feeTableBody) {
      feeTableBody.innerHTML = schoolData.fees
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.group)}</td>
              <td>${escapeHtml(item.admissionFee)}</td>
              <td>${escapeHtml(item.tuitionFee)}</td>
            </tr>
          `
        )
        .join("");
    }

    renderCards("#admission-steps", schoolData.admissionSteps, (item, index) => {
      return `
        <article class="step-card" data-step="${index + 1}" data-reveal>
          <h3>Step ${index + 1}</h3>
          <p>${escapeHtml(item)}</p>
        </article>
      `;
    });

    renderCards("#session-windows", schoolData.sessionWindows, (item) => {
      return `
        <article class="detail-card" data-reveal>
          <p class="eyebrow">Schedule</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `;
    });

    renderCards("#admission-downloads", schoolData.downloads, (item) => {
      return `
        <article class="download-card" data-reveal>
          <span class="download-type">${escapeHtml(item.type)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <a class="button button--ghost" href="${item.href}" target="_blank" rel="noreferrer">
            Open file
          </a>
        </article>
      `;
    });
  }

  function renderFaculty() {
    const leadershipMount = document.getElementById("faculty-leadership");
    const renderFacultyTable = (columns, rows, emptyMessage) => `
      <div class="table-shell faculty-table" data-reveal>
        <table>
          <thead>
            <tr>
              ${columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows
                    .map(
                      (row) => `
                        <tr>
                          ${row
                            .map((cell, index) =>
                              index === 0
                                ? `<th scope="row">${escapeHtml(cell)}</th>`
                                : `<td>${escapeHtml(cell)}</td>`
                            )
                            .join("")}
                        </tr>
                      `
                    )
                    .join("")
                : `
                    <tr>
                      <td class="faculty-table__empty" colspan="${columns.length}">${escapeHtml(emptyMessage)}</td>
                    </tr>
                  `
            }
          </tbody>
        </table>
      </div>
    `;

    if (leadershipMount) {
      leadershipMount.innerHTML = renderFacultyTable(
        ["Sl. No.", "Name", "Role", "Qualification"],
        schoolData.leadership.map((item, index) => [
          `${index + 1}.`,
          item.name,
          item.role,
          item.qualification
        ]),
        "No leadership records available."
      );
      observeReveals(leadershipMount);
    }

    const facultyGrid = document.getElementById("faculty-grid");
    if (!facultyGrid) {
      return;
    }

    const countNode = document.getElementById("faculty-count");
    const searchInput = document.getElementById("faculty-search");
    const filters = Array.from(document.querySelectorAll("[data-staff-filter]"));
    const jumpLinks = Array.from(document.querySelectorAll("[data-staff-jump]"));
    let activeFilter = "all";

    const renderDirectory = () => {
      const term = (searchInput?.value || "").trim().toLowerCase();
      const filteredStaff = schoolData.staffDirectory.filter((person) => {
        const matchesFilter = activeFilter === "all" ? true : person.group === activeFilter;
        const haystack = `${person.name} ${person.role} ${person.qualification}`.toLowerCase();
        const matchesSearch = term ? haystack.includes(term) : true;
        return matchesFilter && matchesSearch;
      });

      if (countNode) {
        countNode.textContent = `${filteredStaff.length} records shown`;
      }

      facultyGrid.innerHTML = renderFacultyTable(
        ["Sl. No.", "Name", "Role", "Qualification", "Department"],
        filteredStaff.map((person, index) => [
          `${index + 1}.`,
          person.name,
          person.role,
          person.qualification,
          person.group === "teaching" ? "Teaching" : "Support"
        ]),
        "No matching records. Try a different search term or switch back to the full directory."
      );

      observeReveals(facultyGrid);
    };

    const setActiveFilter = (nextFilter) => {
      activeFilter = nextFilter;
      filters.forEach((node) => {
        node.classList.toggle("is-active", (node.dataset.staffFilter || "all") === activeFilter);
      });
      renderDirectory();
    };

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        setActiveFilter(button.dataset.staffFilter || "all");
      });
    });

    jumpLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const nextFilter = link.dataset.staffJump || "all";
        setActiveFilter(nextFilter);
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", renderDirectory);
    }

    renderDirectory();
  }

  function renderLocation() {
    renderCards("#school-profile", schoolData.schoolProfile, (item) => {
      return `
        <article class="detail-card" data-reveal>
          <p class="eyebrow">School detail</p>
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.value)}</p>
        </article>
      `;
    });

    renderCards("#affiliation-profile", schoolData.affiliationProfile, (item) => {
      return `
        <article class="detail-card" data-reveal>
          <p class="eyebrow">Affiliation</p>
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.value)}</p>
        </article>
      `;
    });
  }

  function setupEnquiryForm() {
    const form = document.querySelector("[data-enquiry-form]");
    if (!form) {
      return;
    }

    const statusNode = form.querySelector(".form-status");
    const submitButton = form.querySelector('button[type="submit"]');
    const fields = Array.from(form.querySelectorAll("input, select, textarea")).filter(
      (field) => field.type !== "hidden" && field.name !== "bot-field"
    );

    const validators = {
      email(value) {
        if (!value) {
          return "";
        }
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter a valid email address.";
      },
      phone(value) {
        return /^[0-9+\s-]{7,15}$/.test(value) ? "" : "Enter a valid phone number.";
      }
    };

    function setFieldError(field, message) {
      const errorNode = form.querySelector(`[data-error-for="${field.name}"]`);
      const fieldWrapper = field.closest(".field");

      if (errorNode) {
        errorNode.textContent = message;
      }

      if (fieldWrapper) {
        fieldWrapper.classList.toggle("is-invalid", Boolean(message));
      }
    }

    function validateField(field) {
      const value = field.value.trim();
      let message = "";

      if (field.required && !value) {
        message = "This field is required.";
      } else if (field.name === "email") {
        message = validators.email(value);
      } else if (field.name === "phone" && value) {
        message = validators.phone(value);
      }

      setFieldError(field, message);
      return !message;
    }

    fields.forEach((field) => {
      field.addEventListener("input", () => validateField(field));
      field.addEventListener("blur", () => validateField(field));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const isValid = fields.every((field) => validateField(field));

      if (!isValid) {
        if (statusNode) {
          statusNode.dataset.state = "error";
          statusNode.textContent = "Please correct the highlighted fields before sending the enquiry.";
        }
        return;
      }

      const formData = new FormData(form);
      const action = form.getAttribute("action") || "/thank-you.html";

      if (statusNode) {
        statusNode.dataset.state = "";
        statusNode.textContent = "Sending your enquiry...";
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      submitNetlifyForm(formData)
        .then(() => {
          window.location.assign(action);
        })
        .catch((error) => {
          if (statusNode) {
            statusNode.dataset.state = "error";
            statusNode.textContent =
              error.message ||
              "The enquiry could not be sent right now. Please try again later or contact the school directly.";
          }
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Send Enquiry";
          }
        });
    });
  }

  async function submitNetlifyForm(formData) {
    if (window.location.protocol === "file:") {
      throw new Error(
        "This form is configured for Netlify Forms. Deploy the site on Netlify to receive direct submissions."
      );
    }

    const payload = new URLSearchParams();
    formData.forEach((value, key) => {
      payload.append(key, String(value));
    });

    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: payload.toString()
    });

    const serverHeader = (response.headers.get("server") || "").toLowerCase();
    const requestId = response.headers.get("x-nf-request-id");
    const isNetlifyResponse = serverHeader.includes("netlify") || Boolean(requestId);

    if (!response.ok || !isNetlifyResponse) {
      throw new Error(
        "The form is ready for Netlify Forms, but this preview environment cannot accept submissions yet."
      );
    }
  }

  function renderCards(selector, items, template) {
    const mount = document.querySelector(selector);
    if (!mount || !Array.isArray(items) || items.length === 0) {
      return;
    }

    mount.innerHTML = items.map((item, index) => template(item, index)).join("");
    observeReveals(mount);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();

(function () {
  const CONTACT_LINKS = [
    {
      label: "Email",
      href: "mailto:cortadoistheonlyone@gmail.com",
      ariaLabel: "Send email to Kenzie"
    },
    {
      label: "GitHub",
      href: "https://github.com/kenzieshane",
      ariaLabel: "GitHub profile",
      external: true
    },
    {
      label: "Instagram",
      href: "https://instagram.com/username_.ks",
      ariaLabel: "Instagram profile",
      external: true
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@imaguyyesmale?si=DhWUqpgpMvud5mC8",
      ariaLabel: "YouTube channel",
      external: true
    },
    {
      label: "Reddit",
      href: "https://www.reddit.com/user/Apprehensive-Fix9704/",
      ariaLabel: "Reddit profile",
      external: true
    }
  ];

  const DEFAULT_TOOLS = [
    {
      label: "Sprite Forge",
      href: "sprite-forge.html",
      description: "Grid arrangement and sheet export"
    },
    {
      label: "Sprite Cropper",
      href: "sprite-pos.html",
      description: "Offset adjustment and transparent export"
    }
  ];

  function getTools() {
    const extras = Array.isArray(window.RPGMV_EXTRA_TOOLS)
      ? window.RPGMV_EXTRA_TOOLS
      : [];
    return DEFAULT_TOOLS.concat(extras).filter((item) => item && item.label && item.href);
  }

  function isActiveLink(href, path) {
    if (!href) return false;
    const cleanPath = path.split("/").pop() || "index.html";
    return cleanPath === href;
  }

  function renderNav(container) {
    const tools = getTools();
    const currentPath = window.location.pathname || "index.html";

    const links = tools
      .map((tool) => {
        const activeClass = isActiveLink(tool.href, currentPath) ? "nav-link is-active" : "nav-link";
        const titleAttr = tool.description ? ` title="${tool.description}"` : "";
        return `<a class="${activeClass}" href="${tool.href}"${titleAttr}>${tool.label}</a>`;
      })
      .join("");

    const contactList = CONTACT_LINKS.map((item) => {
      const target = item.external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<li><a href="${item.href}" aria-label="${item.ariaLabel}"${target}>${item.label}</a></li>`;
    }).join("");

    container.innerHTML = `
      <div class="nav-inner">
        <a class="nav-brand" href="index.html">RPGMV Tools</a>
        <button class="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">Menu</button>
        <div class="nav-links">
          ${links}
          <button class="nav-link nav-contact-toggle" type="button" aria-label="Open credit and contact menu" aria-expanded="false">KS Media</button>
        </div>
      </div>
      <div class="contact-menu" aria-hidden="true">
        <div class="contact-header">KS Media · Credit and Contact</div>
        <ul class="contact-links">
          ${contactList}
        </ul>
      </div>
    `;

    const toggle = container.querySelector(".nav-toggle");
    const contactToggle = container.querySelector(".nav-contact-toggle");
    const contactMenu = container.querySelector(".contact-menu");

    function closeContactMenu() {
      container.classList.remove("contact-open");
      if (contactToggle) {
        contactToggle.setAttribute("aria-expanded", "false");
      }
      if (contactMenu) {
        contactMenu.setAttribute("aria-hidden", "true");
      }
    }

    if (contactToggle) {
      contactToggle.addEventListener("click", () => {
        const open = container.classList.toggle("contact-open");
        contactToggle.setAttribute("aria-expanded", open ? "true" : "false");
        if (contactMenu) {
          contactMenu.setAttribute("aria-hidden", open ? "false" : "true");
        }
      });
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = container.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        if (!open) {
          closeContactMenu();
        }
      });
    }

    document.addEventListener("click", (event) => {
      if (!container.contains(event.target)) {
        closeContactMenu();
      }
    });
  }

  function init() {
    const navHosts = document.querySelectorAll("[data-tool-nav]");
    navHosts.forEach(renderNav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

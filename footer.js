(function () {
  const PRIVACY_POLICY_URL = "https://blog.kenzieshane.my.id/2025/11/about-us.html";
  const APP_VERSION = "v1.0.1";

  function renderFooter(host) {
    const year = new Date().getFullYear();
    host.innerHTML = `
      <div class="site-footer-inner">
        <div class="footer-links">
          <a href="${PRIVACY_POLICY_URL}" target="_blank" rel="noopener noreferrer" aria-label="Read Privacy Policy">Privacy Policy</a>
        </div>
        <div class="footer-version">${APP_VERSION}</div>
        <div class="footer-copy">Copyright © ${year} KS Media. All rights reserved.</div>
      </div>
    `;
  }

  function init() {
    const hosts = document.querySelectorAll("[data-site-footer]");
    hosts.forEach(renderFooter);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

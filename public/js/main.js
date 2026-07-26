(function () {
  const body = document.body;
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  const backdrop = document.getElementById("nav-backdrop");

  if (!toggle || !nav) return;

  function setOpen(open) {
    body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  function close() {
    setOpen(false);
  }

  toggle.addEventListener("click", function () {
    setOpen(!body.classList.contains("nav-open"));
  });

  if (backdrop) {
    backdrop.addEventListener("click", close);
  }

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", close);
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 768px)").matches) {
      close();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();

(function () {
  const bubble = document.getElementById("whatsapp-bubble");
  if (!bubble) return;

  setTimeout(function () {
    bubble.classList.add("is-visible");
    setTimeout(function () {
      bubble.classList.remove("is-visible");
    }, 5000);
  }, 1200);
})();

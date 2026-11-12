(() => {
  const WHATSAPP = "263711689006";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Header shadow on scroll */
  const header = $(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const burger = $("#burger");
  const nav = $("#nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  window.addEventListener("resize", () => window.innerWidth > 920 && setMenu(false));

  /* Reveal on scroll (staggered within groups) */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const groups = new Map();
    reveals.forEach((el) => {
      const parent = el.parentElement;
      const i = groups.get(parent) || 0;
      el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
      groups.set(parent, i + 1);
    });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Active nav link */
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const so = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
      }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => so.observe(s));
  }

  /* "Request this" pre-selects the service in the form */
  const form = $("#quoteForm");
  $$("[data-service]").forEach((a) =>
    a.addEventListener("click", () => {
      const radio = $$('input[name="service"]', form).find((r) => r.value === a.dataset.service);
      if (radio) radio.checked = true;
    })
  );

  /* Min date = today */
  const dateInput = form.elements.date;
  const today = new Date();
  dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  /* Quote form → WhatsApp */
  const errorEl = $("#formError");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    const problems = [];
    [f.name, f.phone].forEach((el) => el.classList.remove("is-invalid"));
    $("#serviceChips").classList.remove("is-invalid");

    if (!f.name.value.trim()) { problems.push("your name"); f.name.classList.add("is-invalid"); }
    if (f.phone.value.replace(/\D/g, "").length < 9) { problems.push("a valid phone number"); f.phone.classList.add("is-invalid"); }
    if (!f.service.value) { problems.push("a service"); $("#serviceChips").classList.add("is-invalid"); }

    if (problems.length) {
      errorEl.textContent = `Please add ${problems.join(", ")}.`;
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    const lines = [
      "Hi Dn'Dee Cleaning Services! I'd like a quote.",
      "",
      `Name: ${f.name.value.trim()}`,
      `Phone: ${f.phone.value.trim()}`,
      `Service: ${f.service.value}`,
      `City: ${f.city.value}`,
    ];
    if (f.date.value) lines.push(`Preferred date: ${f.date.value}`);
    if (f.details.value.trim()) lines.push(`Details: ${f.details.value.trim()}`);

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  });

  $("#year").textContent = new Date().getFullYear();
})();

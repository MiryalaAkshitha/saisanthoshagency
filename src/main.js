import "./style.css";
import { gsap } from "gsap";

document.getElementById("year").textContent = new Date().getFullYear();

/* ---- Nav: entrance, hide-on-scroll, mobile toggle, active link ---- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navAnchors = [...navLinks.querySelectorAll("a[href^='#']")];

requestAnimationFrame(() => {
  requestAnimationFrame(() => nav.classList.add("nav-in"));
});

let lastY = window.scrollY;
let suppressHideUntil = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 40);

  const scrollingDown = y > lastY;
  const menuOpen = navLinks.classList.contains("open");
  if (!menuOpen && Date.now() > suppressHideUntil) {
    nav.classList.toggle("nav-hidden", scrollingDown && y > 160);
  }
  lastY = y;
}, { passive: true });

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});
navAnchors.forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    suppressHideUntil = Date.now() + 1000;
  })
);

const sectionMap = navAnchors
  .map((a) => ({ link: a, section: document.querySelector(a.getAttribute("href")) }))
  .filter((entry) => entry.section);

const navSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const match = sectionMap.find((m) => m.section === entry.target);
      if (!match) return;
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => a.classList.remove("active"));
        match.link.classList.add("active");
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);
sectionMap.forEach((m) => navSectionObserver.observe(m.section));

/* ---- Scroll reveal ---- */
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
revealItems.forEach((el) => revealObserver.observe(el));

/* ---- Animated counters ---- */
const counters = document.querySelectorAll(".stat-num[data-count]");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      counterObserver.unobserve(el);
      if (target === 0) {
        el.textContent = `0${suffix}`;
        return;
      }
      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 1.6,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate() {
            el.textContent = `${Math.round(Number(el.textContent))}${suffix}`;
          },
        }
      );
    });
  },
  { threshold: 0.5 }
);
counters.forEach((el) => counterObserver.observe(el));

/* ---- Hero entrance ---- */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  gsap.set(".hero .reveal, .hero-title .word", { opacity: 1, y: 0 });
  gsap.set(".hero-plate", { opacity: 1 });
} else {
  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .fromTo(".hero-plate", { opacity: 0 }, { opacity: 1, duration: 2 }, 0.2)
    .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.15)
    .to(".hero-title .word", { y: 0, duration: 1, stagger: 0.045 }, 0.35)
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.9 }, 0.75)
    .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.9 }, 0.9)
    .to(".hero-stat", { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1.05)
    .to(".scroll-cue", { opacity: 1, y: 0, duration: 0.8 }, 1.5);
}

/* ---- Hero parallax on scroll ---- */
const heroSection = document.getElementById("home");
const heroBg = document.querySelector(".hero-bg");
const heroInner = document.querySelector(".hero-inner");

if (heroSection && heroBg && heroInner && !prefersReducedMotion) {
  let ticking = false;
  const updateHeroParallax = () => {
    const progress = Math.min(window.scrollY / heroSection.offsetHeight, 1);
    heroBg.style.transform = `translateY(${progress * 60}px) scale(${1 + progress * 0.08})`;
    heroInner.style.opacity = String(Math.max(1 - progress * 1.15, 0));
    heroInner.style.transform = `translateY(${progress * 40}px)`;
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateHeroParallax);
        ticking = true;
      }
    },
    { passive: true }
  );
}

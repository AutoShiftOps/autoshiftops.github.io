document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  if (!navToggle || !siteNav) return;

  function openNav() {
    navToggle.classList.add("active");
    siteNav.classList.add("open");
    document.body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
  }
  function closeNav() {
    navToggle.classList.remove("active");
    siteNav.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function (e) {
    if (siteNav.classList.contains("open")) closeNav(); else openNav();
  });

  // close when clicking outside the drawer
  document.addEventListener("click", function (e) {
    if (!siteNav.classList.contains("open")) return;
    const clickedInsideNav = siteNav.contains(e.target) || navToggle.contains(e.target);
    if (!clickedInsideNav) closeNav();
  });

  // close on escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && siteNav.classList.contains("open")) closeNav();
  });

  // on resize, ensure nav resets when switching to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      siteNav.classList.remove("open");
      navToggle.classList.remove("active");
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

// === Mobile Navigation Toggle ===
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      toggle.classList.toggle("open");
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  const navClose = document.querySelector('.nav-close');

  if (navToggle && siteNav && navClose) {
    navToggle.addEventListener('click', () => {
      siteNav.classList.add('active');
      document.body.classList.add('menu-open');
    });

    navClose.addEventListener('click', () => {
      siteNav.classList.remove('active');
      document.body.classList.remove('menu-open');
    });

    document.addEventListener('click', (e) => {
      if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) {
        siteNav.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }
});

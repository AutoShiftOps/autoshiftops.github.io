document.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  imgs.forEach(img => {
    img.addEventListener("load", () => img.classList.add("loaded"));
  });
});

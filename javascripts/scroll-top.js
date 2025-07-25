window.addEventListener("scroll", function() {
  const btn = document.getElementById("scrollTopBtn");
  btn.style.display = window.scrollY > 300 ? "block" : "none";
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

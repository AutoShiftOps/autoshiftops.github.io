document.addEventListener("DOMContentLoaded", function () {
  const searchBox = document.getElementById("searchBox");
  const posts = document.querySelectorAll(".post-card");

  searchBox.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    posts.forEach((post) => {
      const title = post.querySelector("h2").innerText.toLowerCase();
      post.style.display = title.includes(query) ? "block" : "none";
    });
  });
});

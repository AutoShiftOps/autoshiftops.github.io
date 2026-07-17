document.addEventListener("DOMContentLoaded", function () {
  initSidebarToggle();
  initArticleFilter();
  initRepoFeed();
});

/* ---------- Mobile sidebar toggle ---------- */
function initSidebarToggle() {
  var toggle = document.querySelector(".sidebar-toggle");
  var sidebar = document.querySelector(".sidebar");
  if (!toggle || !sidebar) return;

  toggle.addEventListener("click", function () {
    var open = sidebar.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  sidebar.querySelectorAll(".sidebar-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      sidebar.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Search + pill filter on Latest Articles ---------- */
function initArticleFilter() {
  var searchBox = document.getElementById("articleSearch");
  var pillBar = document.getElementById("pillBar");
  var cards = document.querySelectorAll(".article-card");
  var noResults = document.getElementById("noResults");
  if (!cards.length) return;

  var pillKeywords = {
    devops: ["devops", "ci/cd", "automation", "pipeline", "gitops"],
    ai: ["ai", "llm", "llms", "genai", "machine learning", "agent", "agents", "chatgpt"],
    kubernetes: ["kubernetes", "k8s", "helm", "container", "containerization"],
    cloud: ["cloud", "aws", "gcp", "azure", "terraform", "iac", "multi-cloud", "serverless"],
    "incident-response": ["incident", "runbook", "postmortem", "chaos"],
    sre: ["sre", "observability", "monitoring", "alerting", "reliability"]
  };

  var activePill = "all";

  function applyFilters() {
    var query = (searchBox.value || "").trim().toLowerCase();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var tags = card.getAttribute("data-tags") || "";
      var title = card.getAttribute("data-title") || "";

      var matchesPill = activePill === "all" || (pillKeywords[activePill] || []).some(function (k) {
        return tags.indexOf(k) !== -1;
      });
      var matchesSearch = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1;

      var visible = matchesPill && matchesSearch;
      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount++;
    });

    if (noResults) noResults.hidden = visibleCount !== 0;
  }

  if (searchBox) searchBox.addEventListener("input", applyFilters);

  if (pillBar) {
    pillBar.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        pillBar.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activePill = btn.getAttribute("data-pillar");
        applyFilters();
      });
    });
  }
}

/* ---------- Live GitHub repositories, with static fallback ---------- */
function initRepoFeed() {
  var grid = document.getElementById("repoGrid");
  if (!grid) return;
  var org = grid.getAttribute("data-org");

  var fallbackRepos = [
    { name: "sql-query-analyzer", description: "QueryTuner's core engine — SQL performance analysis across five dialects.", language: "Python", html_url: "https://github.com/AutoShiftOps/sql-query-analyzer" },
    { name: "incopilot", description: "Incident-triage CLI agent that automates the first 15 minutes of a production incident.", language: "Python", html_url: "https://github.com/AutoShiftOps/incopilot" },
    { name: "alertdecider", description: "Alert decision layer that normalizes noisy signals and emits decisions with reasons.", language: "Python", html_url: "https://github.com/AutoShiftOps/alertdecider" },
    { name: "sql-sp-companion", description: "Analyzes stored procedures for safe database migration.", language: "HTML", html_url: "https://github.com/AutoShiftOps/sql-sp-companion" }
  ];

  fetch("https://api.github.com/orgs/" + org + "/repos?sort=updated&per_page=6")
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API error " + res.status);
      return res.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos) || !repos.length) throw new Error("empty repo list");
      renderRepos(grid, repos);
    })
    .catch(function () {
      renderRepos(grid, fallbackRepos);
    });
}

function renderRepos(grid, repos) {
  grid.innerHTML = repos.map(function (repo) {
    var desc = repo.description || "No description yet.";
    var lang = repo.language || "—";
    return (
      '<div class="card">' +
        '<div class="card-top"><span class="dot"></span><span class="lang">' + escapeHtml(lang) + '</span></div>' +
        '<h4>' + escapeHtml(repo.name) + '</h4>' +
        '<p>' + escapeHtml(desc) + '</p>' +
        '<a class="repo-link" href="' + repo.html_url + '" target="_blank" rel="noopener">view repository &rarr;</a>' +
      '</div>'
    );
  }).join("");
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

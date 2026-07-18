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
var REPO_CACHE_KEY = "autoshiftops-repo-cache-v1";

function initRepoFeed() {
  var grid = document.getElementById("repoGrid");
  if (!grid) return;
  var org = grid.getAttribute("data-org");

  // Kept in sync with the org's actual public repos so a rate-limited visitor
  // (GitHub's unauthenticated API caps at 60 req/hour per IP) still sees a
  // current list instead of a stale placeholder.
  var fallbackRepos = [
    { name: "autoshiftops.github.io", description: "This site — Jekyll source for autoshiftops.com.", language: "HTML", html_url: "https://github.com/AutoShiftOps/autoshiftops.github.io" },
    { name: "teaching-python", description: "Python teaching to the students.", language: "JavaScript", html_url: "https://github.com/AutoShiftOps/teaching-python" },
    { name: "sql-sp-companion", description: "Validate and provide the detailed information about Stored Procedure.", language: "HTML", html_url: "https://github.com/AutoShiftOps/sql-sp-companion" },
    { name: "sajja-command-center", description: "All internal trackings.", language: "JavaScript", html_url: "https://github.com/AutoShiftOps/sajja-command-center" },
    { name: "incopilot", description: "A practical incident-triage CLI agent.", language: "Python", html_url: "https://github.com/AutoShiftOps/incopilot" },
    { name: "resume", description: "My personal professional resume.", language: "JavaScript", html_url: "https://github.com/AutoShiftOps/resume" },
    { name: "sql-query-analyzer", description: "SQL Analyzer project — QueryTuner's core engine.", language: "Python", html_url: "https://github.com/AutoShiftOps/sql-query-analyzer" },
    { name: "abandoned-selves", description: "No description yet.", language: "JavaScript", html_url: "https://github.com/AutoShiftOps/abandoned-selves" },
    { name: "alertdecider", description: "Building an alert decision layer that normalizes alerts, applies an opinionated rule engine, and emits decisions with reasons.", language: "Python", html_url: "https://github.com/AutoShiftOps/alertdecider" },
    { name: "genai-interface", description: "No description yet.", language: "Python", html_url: "https://github.com/AutoShiftOps/genai-interface" },
    { name: "AuditHub", description: "No description yet.", language: "Python", html_url: "https://github.com/AutoShiftOps/AuditHub" }
  ];

  var cached = readRepoCache();
  if (cached) {
    renderRepos(grid, cached);
    return;
  }

  fetch("https://api.github.com/orgs/" + org + "/repos?sort=updated&per_page=30")
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API error " + res.status);
      return res.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos) || !repos.length) throw new Error("empty repo list");
      writeRepoCache(repos);
      renderRepos(grid, repos);
    })
    .catch(function () {
      renderRepos(grid, fallbackRepos);
    });
}

function readRepoCache() {
  try {
    var raw = sessionStorage.getItem(REPO_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeRepoCache(repos) {
  try {
    sessionStorage.setItem(REPO_CACHE_KEY, JSON.stringify(repos));
  } catch (e) {
    // sessionStorage unavailable (private browsing, etc.) — fine to skip caching
  }
}

function renderRepos(grid, repos) {
  grid.innerHTML = repos.map(function (repo) {
    var desc = repo.description || "No description yet.";
    var lang = repo.language || "—";
    var isResume = repo.name.toLowerCase() === "resume";
    var url = isResume ? "/resume/" : repo.html_url;
    var linkText = isResume ? "view live resume &rarr;" : "view repository &rarr;";
    return (
      '<div class="card repo-card">' +
        '<div class="card-top"><span class="dot"></span><span class="lang">' + escapeHtml(lang) + '</span></div>' +
        '<h4>' + escapeHtml(repo.name) + '</h4>' +
        '<p>' + escapeHtml(desc) + '</p>' +
        '<a class="repo-link" href="' + url + '" target="_blank" rel="noopener">' + linkText + '</a>' +
      '</div>'
    );
  }).join("");
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

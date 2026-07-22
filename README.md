# autoshiftops.com

Source for [autoshiftops.com](https://autoshiftops.com) — Sudhakar Sajja's personal site: DevOps/AI-tooling writing, QueryTuner and other open-source projects, certifications, and contact info. Built with Jekyll, deployed via GitHub Actions to GitHub Pages.

## Stack

- **Jekyll 4.4** (Ruby, Liquid templating), Markdown via kramdown
- **GitHub Pages** for hosting, custom domain via `CNAME`
- **GitHub Actions** (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`
- No JS build step — plain CSS/JS in `assets/`, no bundler/webpack

## Local development

```bash
gem install bundler jekyll   # first time only
bundle install
bundle exec jekyll serve
```

Site is served at `http://localhost:4000`.

> **Windows note:** `jekyll-sass-converter`'s dependency chain pulls in native gems (`sass-embedded`, `google-protobuf`, `eventmachine`, etc.). If `bundle install` fails to compile them, install the Ruby DevKit first (`ridk install`).

## Structure

| Path | What it is |
|---|---|
| `index.html` | Homepage — uses the `home` layout (fixed left sidebar + independently scrolling main content) |
| `about.md`, `contact.md`, `projects.md`, `blog.html` | Subpages — use the `default` layout (top nav bar) |
| `_posts/` | Blog posts |
| `_layouts/home.html` | Homepage sidebar shell |
| `_layouts/default.html` | Top-nav shell used by every other page |
| `_includes/sidebar.html` | Homepage sidebar markup (photo, bio, socials, nav) |
| `_includes/icons.html` | Shared inline-SVG icon partial — `{% include icons.html name="github" %}`, reused across the sidebar, publish cards, and the Contact page |
| `_includes/nav.html`, `footer.html` | Top-nav layout's header/footer |
| `assets/css/main.css` | All site styling — single stylesheet, no preprocessor |
| `assets/js/homepage.js` | Homepage-only JS: mobile sidebar toggle, article search/filter, live GitHub repo fetch |
| `assets/js/main.js` | Top-nav layout's mobile menu toggle |

The homepage and the rest of the site intentionally use two different layouts (`home` vs `default`) — that split hasn't been unified yet.

## Config (`_config.yml`)

- `social.*` — every external profile URL (GitHub, LinkedIn, YouTube, dev.to, Medium, DZone, Patreon, Substack). The sidebar, "Where I Publish", and Contact page all read from here, so updating a handle only needs one edit.
- `github_repos_exclude` — repo names (case-insensitive) to hide from the homepage's live-fetched GitHub Repositories section. Applies to both the live API result and its offline fallback list.
- `author.location` — shown in the sidebar and on the Contact page.

## Homepage: live/dynamic pieces

- **GitHub Repositories** — client-side fetch from `api.github.com/orgs/AutoShiftOps/repos` (public, unauthenticated, capped at 60 requests/hour per visitor IP). Falls back to a static list hardcoded in `assets/js/homepage.js` if the fetch fails or gets rate-limited — keep that list roughly in sync with the org's actual repos.
- **Newsletter subscribe** — the Subscribe card posts directly to Substack's public subscribe endpoint (`sajjas.substack.com/api/v1/free`), the same mechanism Substack's own embed widget uses. No custom backend involved.
- **Article search/filter** — client-side only, matches against each post's `categories`/`tags` front matter.
- **Certifications** — static cards with locally-stored badge images (`assets/images/certs/`) linking out to public Credly verification pages; add new ones by hand as they're earned.

## Writing a blog post

See [BLOGGING-WORKFLOW.md](BLOGGING-WORKFLOW.md) for the full guide. Short version: add a file to `_posts/` named `YYYY-MM-DD-slug.md` with `title` / `date` / `categories` / `tags` front matter, commit, push — the site rebuilds automatically. `categories`/`tags` should include the keywords the Blog and homepage filter pills match against (see the workflow doc for the exact list).

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`: installs Ruby + gems, runs `bundle exec jekyll build`, and publishes `_site/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`. Usually live within a minute or two of the push.

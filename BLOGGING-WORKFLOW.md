# Writing & publishing blog posts — going forward

You're already writing posts as Markdown files, which is exactly what this
site expects. Nothing changes about *how* you write — this is about where
the file goes and what goes at the top of it.

## 1. Create the file

New posts live in `_posts/` and must be named:

```
YYYY-MM-DD-a-short-url-slug.md
```

Example: `_posts/2026-07-20-cpu-only-llm-inference.md`

The date in the filename controls the published date and sort order —
it doesn't have to match the date you actually write it, just the date
you want it to appear as published.

## 2. Front matter (the part between `---`)

```yaml
---
title: "Your Post Title Goes Here"
date: 2026-07-20 09:00:00 -0400
categories: [devops, ai]
tags: [llms, machine learning]
excerpt: "One or two sentences summarizing the post."
---
```

- `categories` and `tags` — these are what the blog page's filter buttons
  match against. Use words from this list where relevant so your post shows
  up under the right pillar:
  - **AI & DevOps Tooling** → `ai`, `llm`, `llms`, `machine learning`, `genai`, `agent`, `agents`, `chatgpt`, `ci/cd`, `pipeline`, `automation`, `devsecops`
  - **Cloud & Kubernetes** → `cloud`, `kubernetes`, `terraform`, `iac`, `multi-cloud`, `gitops`, `serverless`, `helm`
  - **Incident Response & SRE** → `incident`, `sre`, `observability`, `monitoring`, `alerting`, `chaos`, `reliability`, `runbook`
  - **Career & MBA Insights** → `career`, `mba`, `product`
  - You can use more than one — a post can belong to multiple pillars.
  - `ai-devops` is intentionally broad: it covers both AI/LLM posts and
    general CI/CD & DevOps-automation posts, since that's most of the
    archive. If a post is really about the underlying pipeline/automation
    mechanics rather than AI, it still belongs here.
- `excerpt` — shown in previews/SEO. Keep it to one or two sentences.

## 3. Write the body

Normal Markdown — headings (`##`, `###`), bullet points, code blocks,
bold/italic, links, blockquotes. All of it is already styled by the site.

## 4. Preview locally before publishing

If you have Ruby + Jekyll installed:

```bash
bundle install
bundle exec jekyll serve
```

Then open `http://localhost:4000` — your new post will show up on the
homepage-adjacent `/blog/` page and be filterable immediately.

If you don't have Jekyll set up locally yet:

```bash
gem install bundler jekyll
```

then run the commands above from the root of the repo.

## 5. Publish

Commit and push to the branch GitHub Pages builds from (usually `main`):

```bash
git add _posts/2026-07-20-cpu-only-llm-inference.md
git commit -m "New post: CPU-only LLM inference"
git push
```

GitHub Pages rebuilds automatically — usually live within a minute or two.

## 6. Images

Put images in `assets/images/posts/` and reference them like:

```markdown
![Alt text describing the image](/assets/images/posts/your-image.png)
```

## That's the whole workflow

Write Markdown → name the file with a date → fill in the front matter →
push. No new tooling to learn beyond what you're already doing — the
front matter tags are the only new habit, and they're what make the
homepage's pillar filtering work automatically as you keep writing.

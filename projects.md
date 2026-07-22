---
layout: page
title: Projects
permalink: /projects/
description: QueryTuner and the supporting tools Sudhakar Sajja is building for AI-powered DevOps.
---
<header class="page-hero">
  <div class="wrap">
    <div class="eyebrow">ls ~/projects</div>
    <h1>Projects</h1>
    <p class="sub">Tools built to solve real operational problems, not portfolio filler.</p>
  </div>
</header>

<section>
  <div class="wrap">
    <div class="flagship">
      <div class="flagship-top">
        <h3>QueryTuner</h3>
        <span class="tag-flagship"><img src="{{ '/assets/images/logos/querytuner-mark.svg' | relative_url }}" alt="" class="tag-icon"> live product</span>
      </div>
      <p>A SQL performance analysis tool that catches slow queries before they hit production. Combines heuristic analysis with an LLM insights layer, and generates shareable reports across five SQL dialects. Built with a FastAPI backend, React/Vite frontend, and Supabase persistence.</p>
      <div class="dialects">
        <span>PostgreSQL</span><span>MySQL</span><span>Oracle</span><span>SQL Server</span><span>SQLite</span>
      </div>
      <div class="flagship-links">
        <a href="{{ site.social.querytuner }}" target="_blank" rel="noopener">Try it live &rarr;</a>
        <a href="{{ site.social.github_org }}/sql-query-analyzer" target="_blank" rel="noopener">View source &rarr;</a>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <span class="label">Live</span>
      <h2>Live Products</h2>
    </div>
    <div class="flagship">
      <div class="flagship-top">
        <h3>SPXray</h3>
        <span class="tag-flagship"><img src="{{ '/assets/images/logos/spxray-mark.svg' | relative_url }}" alt="" class="tag-icon"> live product</span>
      </div>
      <p><em>Previously called SP Migration Companion.</em> Validates and reports on stored procedures ahead of a database migration, flagging risk before it becomes downtime &mdash; no DB connection required, with optional AI migration-risk insights powered by HuggingFace Qwen2.5-Coder. Built and tested as an AWS hackathon entry.</p>
      <div class="dialects">
        <span>T-SQL</span><span>PostgreSQL</span><span>MySQL</span><span>Oracle</span>
      </div>
      <div class="flagship-links">
        <a href="https://spxray.vercel.app" target="_blank" rel="noopener">Try it live &rarr;</a>
        <a href="https://github.com/AutoShiftOps/spxray" target="_blank" rel="noopener">View source &rarr;</a>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <span class="label">Supporting projects</span>
      <h2>Also building</h2>
    </div>
    <div class="grid">
      <div class="card">
        <div class="card-top"><span class="dot"></span><span class="lang">Python</span></div>
        <h4>incopilot</h4>
        <p>A practical incident-triage CLI agent that automates the first 15 minutes of a production incident — pulling context, checking recent deploys, and surfacing likely causes before a human even opens a dashboard.</p>
        <a class="repo-link" href="{{ site.social.github_org }}/incopilot" target="_blank" rel="noopener">github.com/AutoShiftOps/incopilot &rarr;</a>
      </div>
      <div class="card">
        <div class="card-top"><span class="dot"></span><span class="lang">Python</span></div>
        <h4>alertdecider</h4>
        <p>An alert decision layer that normalizes noisy signals from multiple sources, applies an opinionated rule engine, and emits decisions with reasons — designed to cut alert fatigue, not just log more noise.</p>
        <a class="repo-link" href="{{ site.social.github_org }}/alertdecider" target="_blank" rel="noopener">github.com/AutoShiftOps/alertdecider &rarr;</a>
      </div>
    </div>
  </div>
</section>

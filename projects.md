---
layout: default
title: Projects
permalink: /projects/
description: QueryTuner and the supporting tools Sajja is building for AI-powered DevOps.
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
        <span class="tag-flagship">&#9679; live product</span>
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
      <div class="card">
        <div class="card-top"><span class="dot"></span><span class="lang">HTML / Python</span></div>
        <h4>SP Migration Companion</h4>
        <p>Validates and reports on stored procedures ahead of a database migration, flagging risk before it becomes downtime. Built and tested as an AWS hackathon entry, with a path toward becoming a QueryTuner feature.</p>
        <a class="repo-link" href="{{ site.social.github_org }}/sql-sp-companion" target="_blank" rel="noopener">github.com/AutoShiftOps/sql-sp-companion &rarr;</a>
      </div>
    </div>
  </div>
</section>

---
layout: post
title: "🔧 Designing an Alert Decision Layer (with a Working CLI in Python)"
date: 2025-07-26
categories: [Monitoring, Alerting, Python]
tags: [Python, alerting, decision-making]
description: "Build a Python CLI for designing and managing an alert decision layer that intelligently routes and handles alerts."
keywords: [Python, alerting, decision-making, monitoring]
---

# Designing an Alert Decision Layer (with a Working CLI in Python)

Most teams don't have an **alerting problem**. They have a **decision problem**.

- Too many alerts, not enough clear decisions.
- Too many "AI insights", not enough simple rules everyone can understand.

In this post we'll design a small **Alert Decision Layer** and ship a working Python CLI called `alertdecider` that:

- Normalizes alerts from JSON into a compact schema.
- Uses a transparent rule engine to decide: `page`, `ticket`, `suppress`, or `aggregate`.
- Emits a Markdown + JSON report you can paste into your incident tooling.

This is intentionally small but architecturally opinionated — a good stepping stone towards more advanced AI-driven triage later.

## Architecture

High level:

1. **Alert sources** export alerts as JSON (Prometheus Alertmanager, PagerDuty, etc.).
2. `alertdecider` **normalizes** them into a simple `Alert` model.
3. An **AlertDecisionEngine** evaluates each alert using service profiles (tier, SLO criticality) and recent history (flapping / noise).
4. The engine emits a **Decision** (`page` / `ticket` / `aggregate` / `suppress`) plus a short reason.
5. A **reporter** writes `decision_report.md` and `decision_report.json`.

## Project structure

```text
alertdecider-agent/
  __init__.py
  __main__.py
  cli.py          # CLI entry point
  models.py       # Alert, ServiceProfile, History dataclasses
  loader.py       # Load alerts/services/history from JSON/YAML
  engine.py       # Decision rules (AlertDecisionEngine)
  reporter.py     # Console + Markdown/JSON output
examples/
  alerts.json     # Example alerts
  services.yml    # Service risk profiles
  history.json    # Simple alert history
```

## Setup

```bash
git clone https://github.com/AutoShiftOps/alertdecider.git
cd alertdecider
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Try it with the example data

```bash
python -m alertdecider-agent   --alerts examples/alerts.json   --services examples/services.yml   --history examples/history.json   --out-dir out

cat out/decision_report.md
```

You should see:

- The checkout `critical` alert routed to **page** (tier1 + slo-critical).
- The notification `warning` routed to **ticket**.
- The flappy notification alert marked **aggregate** because it fired 25 times in 24h.
- The staging `info` alert **suppressed**.

## Where AI fits later

Once you have a clear decision layer like this, AI becomes a drop-in:

- Turn the `reason` strings into richer explanations (LLM summarization).
- Generate suggested runbook links based on alert name / service.
- Feed the decisions and history into a learning system.

But the core remains **interpretable rules + data you control**.

## Next steps

- Add time-of-day and on-call load into the decision model.
- Persist history (e.g. in a small SQLite DB) instead of JSON.
- Integrate with your real alert source via webhooks.

we will look at a working implementation of this in the next post, where we build out the `AlertDecisionEngine` and CLI in Python. Stay tuned!
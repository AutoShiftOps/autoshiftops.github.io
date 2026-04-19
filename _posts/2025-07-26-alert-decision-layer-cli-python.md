---
layout: post
title: "🔧 Designing an Alert Decision Layer (with a Working CLI in Python)"
date: 2025-07-26
categories: [Monitoring, Alerting, Python]
tags: [Python, alerting, decision-making]
description: "Build a Python CLI for designing and managing an alert decision layer that intelligently routes and handles alerts."
keywords: [Python, alerting, decision-making, monitoring]
---

Most teams don't have an alerting problem. They have a **decision problem**.

Over time, SRE and DevOps teams add more checks, more monitors, more "smart" tools. The result is often alert fatigue: hundreds of alerts, dozens of dashboards, and still no clear answer to the question "Do we wake someone up for this?"

In this post we’ll do two things:

- Design a simple **Alert Decision Layer** – an explicit step between alerts and humans.
- Build a small, working CLI in Python called `alertdecider` that you can run today.

By the end you’ll have:

- A clear architecture for routing alerts to `page`, `ticket`, `aggregate`, or `suppress`.
- A CLI that reads alerts from JSON, applies transparent rules, and outputs a Markdown + JSON report.
- A foundation you can later extend with AI without turning your incident pipeline into a black box.

---

## The problem: alerts without decisions

Alert fatigue has been written about a lot, but the symptoms are consistent:

- On-call engineers get spammed by low-value alerts, become desensitized, and miss the important ones.
- Teams add more tools and even AI summaries, but humans still have to manually decide "page vs ticket vs ignore" for each signal.
- Runbooks and SLOs exist, but the mental model that turns raw alerts into decisions lives in people’s heads.

What’s missing is a **small decision layer** that sits between your alert sources and your incident response.

That layer should be:

- **Transparent** – decisions come from rules everyone can understand and modify.
- **Context-aware** – severity alone isn’t enough; you need service tier, environment, and history.
- **Composable** – easy to extend later with AI-based explanations instead of replacing human judgment.

That’s what we’ll build.

---

## Design principles

Before touching code, let’s describe the design as an architect:

1. **Normalize first, then decide**  
   Every alert source has its own JSON schema. We’ll normalize into a simple `Alert` model (id, name, service, severity, environment, fingerprint, timestamps) before any rules.

2. **Service profiles matter**  
   A `critical` alert on a tier1, SLO-critical service is not the same as a `critical` on a best-effort internal tool. We encode this in a `ServiceProfile` model loaded from `services.yml`.

3. **History influences action**  
   A fingerprint fired once is different from a fingerprint that fired 40 times today. We’ll use a small `History` model to treat flapping/noisy alerts differently.

4. **Rules are code, not magic**  
   The `AlertDecisionEngine` is a small, explicit rule engine. The first version has no AI – just clear if/else policies you can review in code.

5. **Decisions must be explainable**  
   Every decision carries a `reason` string. This is where AI can plug in later to generate richer explanations, but today it’s hand-written and predictable.

---

## Architecture

Here’s the high-level architecture of the Alert Decision Layer:

1. **Sources**  
   - Prometheus Alertmanager, PagerDuty, or any system that can export alerts as JSON.

2. **Normalizer (`loader.py`)**  
   - Reads raw JSON and maps each item into an `Alert` dataclass with a consistent shape.

3. **Context loaders**  
   - `services.yml` → `ServiceProfile` per service (tier, SLO criticality, owner).  
   - `history.json` → `History` per fingerprint (how often we’ve seen this alert recently).

4. **Decision engine (`engine.py`)**  
   - For each `Alert`, looks up the service profile and history and decides one of: `page`, `ticket`, `aggregate`, `suppress`.

5. **Reporters (`reporter.py`)**  
   - Writes a human-friendly `decision_report.md` and a machine-friendly `decision_report.json`.  
   - Prints a table to the terminal so you can sanity-check the decisions quickly.

This is intentionally simple: a single CLI binary that can be run locally, in CI, or as a cron/systemd job.

---

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

You can clone the repo and run it against the example data to see how everything works before wiring it into your own tooling.

---

## Setup

```bash
git clone https://github.com/AutoShiftOps/alertdecider.git
cd alertdecider
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The dependencies are minimal:

- `rich` for nice CLI tables.
- `PyYAML` for `services.yml`.

---

## Modelling alerts, services, and history

We start by defining three small dataclasses in `models.py`:

- `Alert` – normalized alert coming from any source (Prometheus, PagerDuty, etc.).
- `ServiceProfile` – tier and SLO information for a service.
- `History` – how often an alert fingerprint has fired in the last 24 hours.

This gives us a clean domain model to talk about decisions.

---

## Implementing the decision engine

`engine.py` contains the `AlertDecisionEngine` with a handful of clear rules.

Examples of policies encoded:

- **Low-severity non-prod noise**  
  `info` / `debug` in non-prod → `suppress`.

- **Critical on tier1, SLO-critical services**  
  `critical` + `tier1` + `slo_critical=true` → `page`.

- **Flapping alerts**  
  `count_24h >= 20` → `aggregate` (don’t page for every occurrence; treat as noisy/frequent).

- **Warnings on tier1**  
  `warning` on `tier1` → `ticket` (not a page, but still important to track).

- **Default behavior**  
  Prod alerts without a specific rule → `ticket`.  
  Non-prod alerts without a specific rule → `suppress`.

The whole point is that you can read this engine like a policy document.

---

## Running the CLI with example data

With the repo set up, try the example:

```bash
python -m alertdecider-agent   --alerts examples/alerts.json   --services examples/services.yml   --history examples/history.json   --out-dir out

cat out/decision_report.md
```

You’ll see a table in your terminal and a Markdown report with each alert’s decision and reason.

With the provided examples, you should observe:

- A **critical** alert on a tier1, SLO-critical service in prod → **page**.
- A **warning** on a tier1 service → **ticket**.
- A flapping alert with high `count_24h` → **aggregate**.
- A low-severity `info` alert in staging → **suppress**.

From here, you can plug in your own alerts JSON and adjust `services.yml` and `engine.py` to match your reality.

---

## Where AI fits in (later)

Right now, `alertdecider-agent` is deliberately rule-based and transparent.

Once you’re happy with the structure, you can start experimenting with AI in safe, incremental ways:

- **Richer explanations**  
  Feed the normalized alert + decision into an LLM to generate a human-friendly explanation and suggested next steps.

- **Runbook suggestions**  
  Use alert name, service name, and history to suggest a runbook link or dashboard.

- **Rule tuning hints**  
  Analyze real decision logs to recommend new rules (e.g., "this pattern is always suppressed but often escalated manually").

The important part is: the control plane (what gets paged vs ticketed vs suppressed) remains in code you own.

---

## Next steps for your team

If you try this out, here are some directions to evolve it:

- **Add time-of-day and on-call load**  
  Don’t page at 03:00 for something that can safely be a ticket until business hours.

- **Persist history more robustly**  
  Replace `history.json` with a small SQLite table or a lightweight time-series store.

- **Integrate with your actual alert pipeline**  
  Wire `alertdecider` into Alertmanager/PagerDuty via webhooks, or run it as part of your incident ingestion path.

- **Measure impact**  
  Track how many alerts are suppressed or aggregated, and how many pages you avoided without missing true incidents.

This is the kind of small, opinionated tool that can pay off quickly for SRE/DevOps teams drowning in alerts – and it’s a great foundation for more advanced AI-assisted incident management.
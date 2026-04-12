---
layout: post
title: "🚀 Build an AI Incident Copilot (CLI) in Python: Summarize Logs + Suggest Next Commands"
date: 2025-11-29
categories: [DevOps, AI, Incident Management, Machine Learning]
tags: [AI agents, incident management, Python, log analysis, command suggestions, machine learning, AutoShiftOps]
description: "A practical DevOps tool you can run over SSH in minutes (journalctl, docker logs, or plain files)"
keywords: [AI agents, incident management, Python, log analysis, command suggestions, machine learning]
---

# Build an AI Incident Copilot (CLI) in Python

When an incident hits, most engineers repeat the same manual loop: pull recent logs, scan for errors, and guess what to check next.

This post builds **incopilot**—a CLI tool that automates the first-pass triage:

- Collect logs from **systemd journal** and/or **Docker**
- Detect high-signal patterns (timeouts, OOM, disk full, 5xx, panics)
- Map findings to the **Four Golden Signals**
- Output `report.md` + `report.json` ready to paste into an incident doc

> Safe by design: suggestions only — no destructive commands.

## Architecture
[![Architecture diagram](/assets/images/posts/2025-11-29-ai-incident-copilot.png)](/assets/images/posts/2025-11-29-ai-incident-copilot.png)

## Project structure
```
incopilot/
  __init__.py
  cli.py          # argument parsing + console output
  collectors.py   # journalctl, docker logs, file, bundle
  analyzer.py     # pattern detection + line normalization
  reporter.py     # report.md / report.json generation
  config.py       # patterns, golden-signal map, safe-command list
scripts/
  demo_generate_sample_logs.py
posts/
requirements.txt
pyproject.toml
README.md
```

## Setup
```bash
git clone https://github.com/AutoShiftOps/incopilot.git
cd incopilot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Quick test (no real services needed)
```bash
python scripts/demo_generate_sample_logs.py
python -m incopilot file --path sample.log
ls out/
```

## Systemd journal triage
```bash
python -m incopilot journal --unit nginx --since "30 min ago"
```

## Docker triage
```bash
python -m incopilot docker --container my-api --since 1h
```

## Both sources (bundle)
```bash
python -m incopilot bundle \
  --unit nginx \
  --container my-api \
  --since-journal "30 min ago" \
  --since-docker 1h
```

## What you get
`out/report.md` — paste into your incident doc  
`out/report.json` — attach to a ticket or POST to a webhook

## What to improve next
- Per-service pattern packs (nginx, postgres, java, node)
- Slack/Teams webhook posting (`--webhook <url>`)
- Unit tests + GitHub Actions CI
- Scheduled timer (systemd timer unit) for proactive reports



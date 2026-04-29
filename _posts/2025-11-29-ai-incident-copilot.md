---
layout: post
title: "🚀 Building an AI Incident Copilot: How I Automated the First 15 Minutes of Every Production Incident"
date: 2025-11-29
categories: [DevOps, AI, Incident Management, Machine Learning]
tags: [AI agents, incident management, Python, log analysis, command suggestions, machine learning, AutoShiftOps]
description: "A practical DevOps tool you can run over SSH in minutes (journalctl, docker logs, or plain files)"
keywords: [AI agents, incident management, Python, log analysis, command suggestions, machine learning]
---

Every production incident follows the same painful ritual.

An alert fires at 2am. An engineer wakes up, SSH's into a server, and begins the manual loop — pulling logs, scanning for errors, guessing what to check next. This loop can take 15 to 45 minutes before the real diagnosis even begins. Multiply that by every incident across every team in your organisation, and you have thousands of engineering hours lost every year to work that is repetitive, stressful, and largely automatable.

I've been on that on-call rotation. I know what it costs — not just in time, but in cognitive load, in missed context, and in the compounding pressure of an active incident. So I built incopilot: a CLI tool that automates the entire first-pass triage so engineers can skip straight to actual problem-solving.

This post walks through the architecture, the design decisions, and exactly how to build it yourself. Everything is open source at https://github.com/AutoShiftOps/incopilot.

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


Sudhakar Sajja is an Application Architect at TechMahindra with 13 years of experience across protocol testing, SDET, DevOps, and cloud architecture. He specialises in AI-powered DevOps operations — building tools that use LLMs to replace manual incident response and query diagnostics. He writes weekly at AutoShiftOps (autoshiftops.com) and built QueryTuner (querytuner.com), an AI-driven SQL query analysis tool. Based in Mississauga, Canada.
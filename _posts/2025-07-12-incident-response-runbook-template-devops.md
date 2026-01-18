---
layout: post
title: "Incident Response Runbook Template for DevOps (Alert → Mitigation → Comms)"
date: 2025-07-12
categories: [Automation, Linux, Bash, Incident]
tags: [Automation, Scripting, Bash, Linux, Incident, AutoShiftOps]
description: "A ready to use incident response runbook template with severity levels, comms cadence, and Linux triage commands to reduce MTTR."
keywords: [shell scripting, bash scripting, devops, Linux]
---

## Incident Response Runbook Template for DevOps
Incidents are stressful when the team is improvising. A simple runbook reduces MTTR by making response repeatable, not heroic.
​
This post provides a ready to use incident response runbook template plus a practical Linux triage checklist you can run from any box.

## What this runbook optimizes for
- Fast acknowledgement and clear ownership (Incident Commander + roles).
- Early impact assessment and severity assignment to avoid under/over‑reacting.
- Communication cadence and “known/unknown/next update” structure that builds trust.
- Evidence capture (commands + logs) to support post‑incident review.

## The incident runbook template
Copy this into your internal wiki, README, Notion, or ops repo.
​
1. Trigger

    <b>Triggers:</b>
    - Monitoring alert / SLO breach
    - Customer report escalated
    - Internal detection (logs, latency spikes, error spikes)

2. Acknowledge (0–5 minutes)
- Acknowledge page/alert in your paging system.
- Create an incident channel: #inc-YYYYMMDD-service-shortdesc.
- Assign Incident Commander (IC) and Comms Lead.
- Start an incident document: timeline + links + decisions.
​
3. Assess severity (5–10 minutes)

    <b>Answer quickly:</b>
    - What’s impacted (service, region, feature)?
    - How many users / revenue / compliance impact?
    - Is impact ongoing and spreading?

    <b>Suggested severity:</b>
    - SEV1: Major outage / severe user impact; immediate coordination.
    - SEV2: Partial outage / significant degradation; urgent but controlled.
    - SEV3: Minor impact; can be handled async.

4. Stabilize first (10–30 minutes)

    <b>Goal:</b> stop the bleeding before chasing root cause.

    <b>Typical mitigations:</b>

    - Roll back the last deploy/config change.
    - Disable a feature flag.
    - Scale up/out temporarily.
    - Fail over if safe.
    - Rate-limit or block abusive traffic.

5. Triage checklist (host-level)
    Run these to establish the baseline quickly (copy/paste friendly).

    <b>CPU</b>
        
    ```bash
    ps aux --sort=-%cpu | head -15
    ```
    <b>Alert cue:</b> any process >50% sustained.

    <b>Memory</b>
    ```bash
    free -h
    ```

    <b>Alert cue:</b> available <20% total RAM.

    <b>Disk</b>

    ```bash
    df -h
    du -sh /var/log/* 2>/dev/null | sort -h | tail -10
    ```
    <b>Alert cue:</b> any filesystem >90%.
    ​

    <b>Disk I/O</b>

    ```bash
    iostat -x 1 3
    ```
    <b>Alert cue:</b> %util >80%, await >20ms.

    <b>Network listeners</b>

    ```bash
    ss -tuln
    ```
    <b>Alert cue:</b> unexpected listeners/ports.
    ​
    <b>Logs (example: nginx)</b>

    ```bash
    journalctl -u nginx -f
    ```
    <b>Alert cue:</b> 5xx errors spiking.

6. Comms cadence (keep it boring)<br/>

    SEV1: updates every 10–15 minutes.​<br/>
    SEV2: updates every 30 minutes.<br/>
    SEV3: async updates acceptable.<br/>
    <br/>​
    Use this structure:
    - What we know
    - What we don’t know
    - What we’re doing now
    - Next update at: TIME
​

7. Verify resolution
    - Confirm user impact is gone (synthetic checks + error rate + latency).
    - Confirm saturation is back to normal (CPU/memory/disk/I/O).
    - Watch for 30–60 minutes for regression.

8. Close and learn (post-incident)
    - Write a brief timeline (detection → mitigation → resolution).
    - Capture what worked, what didn’t, and what to automate.
    - Create follow-ups: alerts tuning, runbook updates, tests, guardrails.

## Bonus: “Golden signals” lens for incidents
When you’re lost, anchor on the four golden signals:

- Latency (are requests slower?)
- Traffic (is demand abnormal?)
- Errors (is failure rate rising?)
- Saturation (are resources hitting limits?)

This keeps triage focused on user impact and system limits, not vanity metrics.
​

## Download / reuse
If you reuse this template internally, make one improvement immediately: add links to dashboards, logs, deploy history, and owners for each service. Your future self will thank you.
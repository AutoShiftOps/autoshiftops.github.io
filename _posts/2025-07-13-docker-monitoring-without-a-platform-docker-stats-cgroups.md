---
layout: post
title: "Docker Monitoring Without a Platform: docker stats + cgroups (DevOps Field Guide)"
date: 2025-07-13
categories: [Docker, Linux, SRE, Observability]
tags: [Automation, SRE, Bash, Linux, Docker, AutoShiftOps]
description: "Learn container monitoring from the terminal: docker stats, docker inspect, logs, and how cgroups/namespaces explain CPU/memory/I/O behavior."
keywords: [Docker, cgroups, docker inspect]
---

When an incident hits a containerized service, you often don’t need a full observability stack to get traction. You need fast answers: Which container is hot? What resource is saturating? Is it an app problem or a limit problem?

This guide shows a practical monitoring stack you can run from any Docker host:

1. Docker-level commands (docker stats, docker inspect, docker logs)
2. Host Linux tools (ps/top/free/df/iostat/ss/journalctl)
3. Kernel primitives: cgroups (resource limits/accounting) and namespaces (isolation)

## 1) Start with docker stats (the fastest signal)
docker stats streams runtime metrics for containers, including CPU%, memory usage/limit, network I/O, and block I/O.

```bash
docker stats
```

Common workflows:

```bash
docker stats --no-stream          # Snapshot (good for scripts)
docker stats <container_name>     # Focus on one container
```

How to interpret it (in plain language)
- **CPU%:** who’s burning compute right now.
- **MEM USAGE / LIMIT:** how close you are to the memory ceiling.
- **NET I/O:** traffic spikes, retries, or unusual egress.
- **BLOCK I/O:** slow disks, chatty logging, or heavy read/write workloads.

## 2) Jump from “container name” → “what is it?”
Once you identify a hot container, immediately gather identity + configuration.

```bash
docker ps
docker inspect <container> | less
```

Useful inspect questions:

- What image/tag is running?
- What env vars/config are set?
- What ports and volumes are attached?
- Are there memory/CPU limits configured?

## 3) Logs: confirm symptoms fast

```bash
docker logs --tail 200 <container>
docker logs -f <container>
```

This is often enough to spot:

- crash loops
- OOM errors / memory pressure
- upstream timeouts
- DB connection exhaustion

## 4) Understand why it’s happening: cgroups + namespaces (the mental model)
Docker relies on Linux kernel features:

- Namespaces isolate views of processes, networking, mounts, etc.
- cgroups control and account for resources like CPU, memory, and I/O.

Why this matters during incidents:

- A container can be “slow” because it’s CPU-throttled, not because the app code suddenly got worse.
- A container can restart because it hit its memory limit and the kernel’s OOM behavior targeted its processes.

## 5) Host-level confirmation (tie back to your Linux monitoring toolkit)
When docker stats shows a spike, verify on the host to avoid false conclusions.

### CPU hogs

```bash
ps aux --sort=-%cpu | head -15
```

### Memory pressure

```bash
free -h
```

### Disk full / log explosions

```bash
df -h
du -sh /var/lib/docker/* 2>/dev/null | sort -h | tail -10
```

### Disk I/O saturation

```bash
iostat -x 1 3
```

### Unexpected listeners / traffic patterns

```bash
ss -tuln
```

These host checks help you decide whether you’re dealing with a single container or a node-wide saturation problem.
​
## 6) What to do with the data (action mapping)
Use the shortest safe path to stability:

- CPU high + latency rising

    - If CPU is legitimately needed: scale out / add capacity.
    - If CPU is throttled: revisit limits/requests (or container CPU shares).

- Memory near limit

    - If memory leak suspected: restart as mitigation + open an issue with heap profiling.
    - If limit too low for normal peaks: adjust limit carefully and monitor.

- Block I/O high

    - Check log volume and disk saturation; reduce noisy logs or move logs off disk.
    - Consider storage performance constraints and workload patterns.

- Network I/O abnormal

    - Look for retries, timeouts, DDoS/abuse patterns, or upstream issues.

## 7) Copy/paste triage sequence (5 minutes)

```bash
# 1) Find the hot container
docker stats --no-stream

# 2) Identify it
docker ps
docker inspect <container> | less

# 3) Check symptoms
docker logs --tail 200 <container>

# 4) Confirm on host (avoid guessing)
ps aux --sort=-%cpu | head -10
free -h
df -h
iostat -x 1 3
ss -tuln
```

## Next in the series
<b>Next post:</b> Container Troubleshooting Playbook (common symptoms → commands → safe mitigations → root cause follow-ups).
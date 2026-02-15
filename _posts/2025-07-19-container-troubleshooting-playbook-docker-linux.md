---
layout: post
title: "The Container Troubleshooting Playbook: OOMs, CPU Spikes, and Network Timeouts"
date: 2025-07-19
categories: [Docker, Linux, Troubleshooting]
tags: [Docker, cgroups, namespaces, troubleshooting, monitoring]
description: "When a containerized service is misbehaving, you need fast answers. This playbook walks through practical commands and mental models to quickly identify and mitigate OOMs, CPU spikes, and network timeouts using Docker and Linux tools."
keywords: [Docker, cgroups, docker inspect]
---

When a container fails in production, you don’t always have time to browse StackOverflow. You need a checklist.

This post is a field guide for the three most common container "murders": Memory (OOMKilled), CPU Throttling, and I/O Saturation. We’ll diagnose each using the `docker stats` + Linux host tools workflow we established last week.

## Scenario 1: The "Silent" Death (OOMKilled)
Symptom: The container restarts randomly. No error logs in the application output because it was killed instantly by the kernel.

### 1. Confirm it was an OOM Kill
Docker knows why the container died. Ask it:

```bash
docker inspect <container> --format '{{.State.OOMKilled}}'
# Output: true
```

Or check the specific exit code (137 = 128 + 9 SIGKILL):

```bash
docker inspect <container> --format '{{.State.ExitCode}}'
# Output: 137
```

### 2. Find the "Smoking Gun" in Kernel Logs
If Docker confirms it, see exactly when the kernel snapped. Run this on the host:

```bash
dmesg -T | grep -i "killed process"
```

You’ll see a line like: `Out of memory: Killed process 1234 (node) total-vm:2048kB, anon-rss:1024kB`.

### 3. The Fix
- **Immediate:** Bump the memory limit if the host has capacity.

    ```bash
    docker update --memory 2g <container>
    ```

- **Root Cause:** Check your application for memory leaks. If it’s Java, check the heap settings (`-Xmx`). If it’s Node, check the GC behavior.

## Scenario 2: The "Slow" Death (CPU Throttling)
Symptom: App is running but incredibly slow. Latency spikes. Health checks time out.
​
### 1. Check if it’s throttling
Linux cgroups enforce CPU limits by "pausing" your process when it uses its quota. It doesn’t kill the app; it just freezes it for milliseconds at a time.

Check `docker stats` first:

```bash
docker stats --no-stream
```

If `CPU %` is consistently near 100% of your configured limit (e.g., if you gave it 0.5 CPUs and it’s at 50%), you are being throttled.

### 2. Verify Throttling in cgroups
Look at the raw cgroup metrics (works on cgroup v1/v2):

```bash
# Find the container ID
docker inspect <container> --format '{{.Id}}'

# Check throttle stats (path varies by distro, commonly:)
cat /sys/fs/cgroup/cpu/docker/<long-id>/cpu.stat
```

Look for `nr_throttled` and `throttled_time`. If these numbers are rising, your app is gasping for air.
​
### 3. The Fix
- **Remove the limit** temporarily to prove it’s the bottleneck.

    ```bash
    docker update --cpus 0 <container>
    ```

- **Tune requests:** If the app needs that CPU, increase the limit. If it’s a bug (infinite loop), profile the app.
​
## Scenario 3: The "Gridlock" (Disk I/O Saturation)
Symptom: The container becomes unresponsive, `docker ps` hangs, or logs stop writing.
​
### 1. Identify the I/O Hog
Is it the container or the neighbor?

```bash
# Check host I/O
iostat -x 1 5
```

If `%util` is >80%, the disk is saturated.

### 2. Blame the Container
Use `pidstat` (part of `sysstat`) to find which process is thrashing the disk:

```bash
pidstat -d 1
```

Look for the PID with high `kB_rd/s` or `kB_wr/s`. Match that PID back to a container:

```bash
docker inspect --format '{{.State.Pid}}' <container>
```

### 3. The Fix
- **Limit the blast radius:** Set a Block I/O limit on the greedy container so it doesn’t kill the host.

    ```bash
    docker update --blkio-weight 100 <container>  # Low priority (default 500)
    ```

- **Move logs:** Ensure your app isn’t logging debug data to the container’s JSON log driver (which writes to disk). Use a log shipper or write to `stdout` sparingly.
​

## Bonus: Network Connectivity Issues
**Symptom:** "Connection refused" or timeouts between containers.

### 1. The "Can I reach it?" Check
Don't guess. Enter the container’s namespace:

```bash
docker exec -it <source-container> sh
# Inside:
ping <target-container-name>
nc -zv <target-container-name> <port>
```

### 2. If DNS fails
Docker has its own internal DNS. Check `/etc/resolv.conf` inside the container:

```bash
cat /etc/resolv.conf
```

It should point to Docker’s embedded DNS server (usually `127.0.0.11`). If it’s missing or wrong, check your daemon config.
​
## Summary Checklist (Copy/Paste)
| Symptom | Check Command | Fix Action |
|---------|---------------|-----------|
| Random Restarts | `docker inspect <container> --format '{{.State.OOMKilled}}'` | Increase RAM limit / Fix memory leak |
| Sluggish App | `cat /sys/fs/cgroup/cpu/docker/<id>/cpu.stat` (check `nr_throttled`) | Increase CPU limit / Profile app |
| Host Unresponsive | `iostat -x 1 5` & `pidstat -d 1` | Limit Block I/O weight / Reduce logging |
| Network Timeout | `docker exec <container> nc -zv <target> <port>` | Check Docker DNS / Verify network aliases |

## Next Steps
Now that you can debug containers manually, how do you automate this? Next week, we’ll build a "Self-Healing" Bash Script that detects these states and alerts you automatically.
---
layout: post
title: "🔧 Self-Healing Containers: Bash Script for Docker Auto-Recovery"
date: 2025-07-20
categories: [Docker, Linux, Troubleshooting]
tags: [Docker, cgroups, namespaces, bash scripting, monitoring, self-healing]
description: "Build a bash watchdog that monitors Docker container health, auto-restarts unhealthy ones, and integrates with systemd and cgroups for production reliability."
keywords: [Docker, docker troubleshooting, cgroups, namespaces, bash scripting, monitoring, self-healing]
---

Manual restarts during incidents are reactive. Self-healing means your containers recover themselves between alerts.

This post shows how to build a lightweight bash watchdog that:

1. Monitors container health via Docker health checks
2. Restarts unhealthy containers
3. Integrates with systemd for daemon-like behavior
4. Logs everything for incident review

## The Self-Healing Architecture
Docker has built-in restart policies (`--restart unless-stopped`), but they don’t respect health checks. A container can be "running" but unhealthy (app crashed, dependencies down, etc.).

Our script loops every 30 seconds:

1. Query Docker API for container health
2. Restart unhealthy containers
3. Log actions to systemd journal
4. Repeat

### Step 1: Docker Health Checks (the foundation)
First, ensure your containers have proper health checks in `docker-compose.yml` or `docker run`:

```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

This marks containers `healthy`, `unhealthy`, or `starting`.

### Step 2: The Self-Healing Watchdog Script
Save this as `/usr/local/bin/docker-autoheal.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Config
CHECK_INTERVAL=30
LOG_FILE="/var/log/docker-autoheal.log"
CONTAINER_LABEL="autoheal=true"  # Label your containers

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $*" | tee -a "$LOG_FILE"
}

heal_containers() {
  local unhealthy=($(docker ps --filter "health=unhealthy" --filter "label=$CONTAINER_LABEL" --format "{{.Names}}"))
  
  for container in "${unhealthy[@]}"; do
    log "RESTARTING UNHEALTHY CONTAINER: $container"
    
    # Graceful stop first
    docker stop "$container" || true
    
    # Hard kill after timeout
    docker kill "$container" || true
    
    # Restart with original command
    docker start "$container"
    
    log "RESTARTED: $container"
  done
}

# Main loop
log "Docker Auto-Heal started (check interval: ${CHECK_INTERVAL}s)"
while true; do
  heal_containers
  sleep "$CHECK_INTERVAL"
done
```

### Step 3: Run as a Systemd Service (production-ready)
Create `/etc/systemd/system/docker-autoheal.service`:

```text
[Unit]
Description=Docker Container Auto-Healer
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/docker-autoheal.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable docker-autoheal.service
sudo systemctl start docker-autoheal.service
```

**Check status:**

```bash
sudo systemctl status docker-autoheal.service
sudo journalctl -u docker-autoheal.service -f
```

### Step 4: Label Your Containers
Tag containers you want to auto-heal:

```bash
docker run -d \
  --label "autoheal=true" \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:8080/health || exit 1" \
  nginx
```

### Step 5: Advanced Features
Grace Period (avoid restart loops)

```bash
# Add to script before restart
if docker inspect "$container" --format '{{.RestartCount}}' | grep -q "10"; then
  log "SKIPPING: $container restart count too high (restart loop?)"
  continue
fi
```

**Webhook Alerts**
```bash
curl -X POST -d "{\"container\":\"$container\",\"action\":\"restart\"}" "$WEBHOOK_URL"
```

### Multi-Host (Docker Swarm)
Use labels + a central orchestrator or run the script on each host.
​
### Testing It (safely)
Spin up a container with a failing health check:

```bash
docker run -d \
  --name test-fail \
  --label "autoheal=true" \
  --health-cmd="exit 1" \
  alpine sleep infinity
```

**Watch it get restarted:**

```bash
journalctl -u docker-autoheal.service -f
```

## Limitations + When to Upgrade
**This works great for:**

- Small deployments / homelabs
- Edge services / single-host apps
- Dev/staging environments

**Upgrade to:**

- Kubernetes: liveness/readiness probes + pod disruption budgets
- Docker Swarm: service replicas + constraints
- Nomad: health checks + restart stanzas

### Summary Table (Copy/Paste)

| Component | Command | Purpose |
|-----------|---------|---------|
| Health Check | `docker ps --filter health=unhealthy` | Find broken containers |
| Watchdog | `systemctl status docker-autoheal` | Confirm service running |
| Logs | `journalctl -u docker-autoheal` | Review restart history |
| Container Labels | `--label autoheal=true` | Target specific services |

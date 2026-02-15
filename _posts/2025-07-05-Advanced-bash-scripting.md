---
layout: post
title: "🚀 Advanced Bash Scripting for DevOps Automation"
date: 2025-07-05
categories: [Automation, Linux, Bash ]
tags: [Automation, Scripting, Bash, Linux, AutoShiftOps]
description: "A comprehensive guide for bash scripting commands essential for Devops Automation."
keywords: [shell scripting, bash scripting, devops, automation]
---

## Why Bash Still Rules DevOps?

Infrastructure as code, containers, and Kubernetes are great, but when you log into a box to fix something right now, Bash is still the fastest tool you have.
​

This post focuses on practical Bash scripting patterns that automate real DevOps tasks: deployments, health checks, log cleanups, and safety‑first operations you can trust in production.
​

## 1. Bash Scripting Foundations Done Right
Even experienced engineers skip basics that later cause flaky scripts.

Always start with a shebang and safe defaults:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
```

- <b>et -e</b> → exit on error

- <b>set -u</b> → fail on undefined variables

- <b>set -o pipefail</b> → fail if any part of a pipe fails
​

Use functions instead of long procedural blobs:

```bash
log() { echo "[$(date +'%F %T')] $*"; }

die() {
  log "ERROR: $*"
  exit 1
}
```

These patterns make scripts safer and easier to reuse across services and environments.

## 2. Parameters, Flags, and Environments
A good DevOps script is configurable without editing the file.

Using Arguments and Defaults

```bash
#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-staging}"   # default to staging

log() { echo "[$(date +'%F %T')] [$ENVIRONMENT] $*"; }

log "Deploying to $ENVIRONMENT"
```

- ${1:-staging} gives you a default while still allowing overrides.

- This pattern works great for scripts you’ll run from CI/CD pipelines.
​

### Robust Flag Parsing
For more complex tools, use getopts:

```bash
while getopts "e:v:h" opt; do
  case "$opt" in
    e) ENVIRONMENT="$OPTARG" ;;
    v) VERSION="$OPTARG" ;;
    h) echo "Usage: deploy.sh -e <env> -v <version>"; exit 0 ;;
    *) exit 1 ;;
  esac
done
```

This turns a script into a proper CLI your team can rely on.​

## 3. Real‑World Deployment Script Pattern
Here’s a simplified multi‑step deployment flow you can adapt for web apps or microservices.
​
```bash
#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-staging}"
APP_DIR="/srv/myapp"
REPO_URL="git@github.com:org/myapp.git"

log() { echo "[$(date +'%F %T')] [$ENVIRONMENT] $*"; }

deploy() {
  log "Updating code..."
  if [[ ! -d "$APP_DIR/.git" ]]; then
    git clone "$REPO_URL" "$APP_DIR"
  fi
  cd "$APP_DIR"
  git fetch --all
  git checkout main
  git pull --ff-only

  log "Installing dependencies..."
  npm ci

  log "Running tests..."
  npm test

  log "Building..."
  npm run build

  log "Restarting service..."
  sudo systemctl restart myapp

  log "Deployment complete."
}

deploy
```

Why this works for DevOps:

- Idempotent: safe to run multiple times.
​
- Ties into systemd for consistent service management.

## 4. Automated Health Checks and Rollbacks
Production automation needs more than “deploy and hope.”

Health Check Example

```bash
health_check() {
  local url="${1:-http://localhost/health}"
  if curl -fsS "$url" > /dev/null; then
    log "Health check passed for $url"
  else
    die "Health check FAILED for $url"
  fi
}
```

Combine this with deployment:

```bash
previous_version() {
  git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo ""
}
```

```bash
rollback() {
  local prev
  prev="$(previous_version)"
  [[ -z "$prev" ]] && die "No previous version found for rollback"

  log "Rolling back to $prev"
  git checkout "$prev"
  npm run build
  sudo systemctl restart myapp
}
```

After deployment:

```bash
deploy
if ! health_check "https://myapp.example.com/health"; then
  log "Health check failed; rolling back"
  rollback
fi
```

This pattern mirrors real‑world blue/green or canary flows on a smaller scale.
​
## 5. Log Rotation and Cleanup Jobs
Bash + cron is still a perfectly valid way to manage logs on smaller setups.
​
### Rotate and Compress Logs

```bash
#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="/var/log/myapp"
DAYS_TO_KEEP=7

find "$LOG_DIR" -type f -name "*.log" -mtime +$DAYS_TO_KEEP -print0 \
  | while IFS= read -r -d '' file; do
      gzip "$file"
    done
```

Remove Old Archives

```bash
find "$LOG_DIR" -type f -name "*.gz" -mtime +30 -delete
```

Schedule with cron:

```bash
crontab -e
# Run cleanup daily at 01:30
30 1 * * * /usr/local/bin/log_cleanup.sh
```

This keeps disks healthy without needing a full log‑management stack.
​
## 6. Monitoring Scripts with Alerts
You can wrap common Linux monitoring commands into Bash scripts that push alerts to Slack, email, or webhooks.
​
Example: CPU and Memory Watchdog

```bash
#!/usr/bin/env bash
set -euo pipefail

CPU_THRESHOLD=80
MEM_THRESHOLD=80

cpu_usage() {
  mpstat 1 1 | awk '/Average/ && $12 ~ /[0-9.]+/ {print 100-$12}'
}

mem_usage() {
  free | awk '/Mem:/ {printf(\"%.0f\", $3/$2 * 100)}'
}

CPU=$(cpu_usage)
MEM=$(mem_usage)

if (( CPU > CPU_THRESHOLD || MEM > MEM_THRESHOLD )); then
  echo "High usage detected: CPU=${CPU}% MEM=${MEM}%"
  # Hook: send to Slack / email / alerting system
fi
```

This complements full monitoring stacks by giving you lightweight, scriptable checks.​

## 7. Safer File and Config Changes
Use Bash to modify configuration files predictably instead of manual edits.

Backups + Atomic Changes

```bash
CONFIG="/etc/myapp/config.yaml"
BACKUP="/etc/myapp/config.yaml.$(date +'%F-%H%M%S').bak"

cp "$CONFIG" "$BACKUP"

# Example: toggle a feature flag
sed -i 's/feature_x: false/feature_x: true/' "$CONFIG"

systemctl restart myapp
```

Pattern:

- Always create timestamped backups.

- Make changes with sed, awk, or yq/jq for structured data.
​
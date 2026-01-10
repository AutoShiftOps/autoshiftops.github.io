---
layout: post
title: "Linux Monitoring & Alerting: Command-Line Mastery for DevOps"
date: 2025-07-06
categories: [Automation, Linux, Bash ]
tags: [Automation, Scripting, Bash, Linux, AutoShiftOps]
description: "A comprehensive guide Linux Monitoring & Alerting."
keywords: [shell scripting, bash scripting, devops, automation]
---

## The Monitoring Gap Every DevOps Engineer Faces

Full monitoring stacks like Prometheus + Grafana are great, but they take time to set up. What about the servers you inherit? The staging environments? The emergency VM you spin up during an outage?

Command-line monitoring is your immediate, universal answer. These tools work on every Linux box, no agents required. Better yet, they're fast enough to script into alerting workflows.

This post covers the essential Linux monitoring commands plus patterns to turn raw metrics into actionable alerts—perfect follow-up to our Bash scripting guide.

## 1. Real-Time Resource Dashboards
The `top`/`htop` Foundation
`top` gives you an instant system snapshot:

```bash
top - 11:26:45 up 5 days,  3:12,  2 users,  load average: 1.23, 1.45, 1.67
Tasks: 234 total,   2 running, 232 sleeping,   0 stopped,   0 zombie
%Cpu(s): 12.3 us,  8.7 sy,  0.0 ni, 78.9 id,  0.1 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :  7900.2 total,  1234.5 free,  4567.8 used,  2097.9 buff/cache
```
<b>Pro move:</b> `htop` (install with `apt install htop`)

- Mouse/keyboard navigation

- Color-coded resource bars

- Tree view of processes (`F5`)

Quick filters:

```bash
htop -p $(pgrep -d, nginx)  # Monitor nginx processes only
```

<b>Memory Deep Dive:</b> `free -h`

```bash
free -h
               total        used        free      shared  buff/cache   available
Mem:           7.7Gi       4.2Gi       1.2Gi       128Mi       2.3Gi       3.1Gi 
Swap:          2.0Gi          0B       2.0Gi
```

What matters: Focus on `available` column, not `free`. Linux aggressively caches to disk.

## 2. CPU Analysis: Who's Eating Cycles?
<b>Per-Process Breakdown</b>

```bash
ps aux --sort=-%cpu | head -10
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
mysql     1234 45.2 12.3 2.1g  980m ?        S    10:00   3:45 /usr/sbin/mysqld
```

<b>Historical CPU Trends:</b> `sar`

```bash
# Install: apt install sysstat
sar -u 1 5     # CPU every 1 sec, 5 samples
sar -u -f /var/log/sysstat/sa08  # Yesterday's data

Average: CPU %user %nice %system %iowait %steal %idle
Average:    all  12.34  0.00  8.76    1.23   0.00  77.67
```

<b>Alert pattern:</b>

```bash
#!/bin/bash
if sar -u 1 3 | tail -1 | awk '{if($8 < 70) exit 1}'; then
  echo "CPU idle <70% for 3s - investigate!"
fi
```

## 3. Disk I/O: The Silent Killer
<b>Current I/O:</b> `iostat`

```bash
iostat -x 1 5
Device            r/s     w/s     rkB/s    wkB/s   rrqm/s   wrqm/s  %rrqm  %wrqm r_await w_await aqu-sz rareq-sz wareq-sz svctm  %util
sda              23.4     1.2   234.5    12.3     0.0     10.2   0.00  89.12    0.1    2.3   0.45    10.0     6.2  1.23  45.2
```

<b>Red flags:</b> `%util >80%`, `await >20ms`

<b>Disk Space Alerts:</b> `df`

```bash
df -h --output=source,fstype,size,used,avail,pcent,target | grep -v tmpfs
```

<b>Scriptable alert:</b>

```bash
df -h | grep -E "[8-9][0-9]%|[9][0-9]%|[100]%" || echo "Disk healthy"
```

## 4. Network Troubleshooting Masters
<b>Active Connections:</b> `ss`

```bash
# Replace netstat everywhere
ss -tuln          # Listening TCP/UDP
ss -tunap | grep :80   # Processes on port 80
ss -t state established | grep :443 | wc -l  # Active HTTPS connections
```

<b>Drop Counters:</b> `netstat` or `ss`

```bash
netstat -s | grep -E "errors|dropped|retrans"
Ip:
    1234 total packets received
    56 dropped because of memory problems
```

<b>Live Packet Capture:</b> `tcpdump`

```bash
# Capture 100 packets on interface eth0, port 80
sudo tcpdump -i eth0 -c 100 port 80 -w capture.pcap

# Read capture
tcpdump -r capture.pcap -nn
```

## 5. Log Monitoring: Beyond tail -f
<b>Service Logs:</b> `journalctl`

```bash
journalctl -u nginx -f           # Follow nginx logs
journalctl -u nginx --since "1h ago"  # Last hour
journalctl -p err -u nginx      # Only errors
journalctl --no-pager | grep -i panic  # System panics
```

<b>Pattern Mining:</b> `grep + awk`

```bash
# Count 5xx errors per minute
journalctl -u nginx --since "10min ago" | \
grep " 500 " | \
awk '{print $1, $2}' | cut -d. -f1 | sort | uniq -c

# Slow requests (>2s)
awk '$NF > 2 {print}' /var/log/nginx/access.log
```

## 6. Production Alerting Patterns
<b>CPU/Memory Watchdog</b>

```bash
#!/bin/bash
set -euo pipefail

alert() { curl -X POST -d "CPU ${CPU}%, MEM ${MEM}%" "$SLACK_WEBHOOK"; }

CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
MEM=$(free | awk '/Mem:/ {printf "%.0f", $3/$2 * 100}')

[[ "$CPU" -gt 80 || "$MEM" -gt 80 ]] && alert
```

<b>Disk Space Guardian</b>

```bash
#!/bin/bash
for fs in $(df --local --output=source | tail -n +2); do
  usage=$(df $fs | tail -1 | awk '{print $5}' | sed 's/%//')
  [[ $usage -gt 85 ]] && echo "ALERT: $fs at ${usage}%"
done
```

<b>Cron schedule:</b>

```bash
# Every 5 minutes
*/5 * * * * /usr/local/bin/check_resources.sh
```

## 7. One-Line Dashboards
<b>Combine tools into instant observability:</b>

```bash
# System overview (alias this to 'sys')
watch -n 2 'printf "\nCPU: "; sar -u 1 1 |tail-1; printf "MEM: "; free -h |tail-1; printf "DISK: "; df -h / /var |tail -2'
```

```bash
# Top resource hogs
watch -n 2 'ps aux --sort=-%cpu | head -8; echo "---"; ps aux --sort=-%mem | head -8'
```

## Quick Reference Table
```
| Scenario    | Command                | Pro Tip                              |
| ----------- | ---------------------- | ------------------------------------ |
| CPU trends  | sar -u 1 5             | Historical data in /var/log/sysstat/ |
| Memory      | free -h                | Watch available, ignore free         |
| Disk I/O    | iostat -x 1            | %util >80% = trouble                 |
| Connections | ss -tuln               | Modern netstat replacement           |
| Logs        | journalctl -u nginx -f | systemd's tail -f                    |
| Processes   | htop -p $(pgrep nginx) | Filter to specific app               |
```
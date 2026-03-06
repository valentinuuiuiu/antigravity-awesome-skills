---
name: jules-monitor
description: "A monitor script to clean up after other agents, keep network connection open, and check TASK_QUEUE.md on the VPS."
risk: safe
source: agent-created
---

# Jules Monitor

This skill deploys a cron job to the VPS to keep the network connection open, perform cleanup, and check the task queue.

## Capabilities

- Cleans up stuck processes
- Keeps network connection alive by pinging an external server
- Checks `TASK_QUEUE.md` for pending tasks

## When to Use

Use this skill when you need to ensure the VPS environment is stable and ready for agent operations.

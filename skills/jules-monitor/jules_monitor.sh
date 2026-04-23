#!/bin/bash
# Jules monitor script to clean up after other agents, keep network connection open, and check TASK_QUEUE.md

LOG_FILE="/root/logs/jules_monitor.log"
QUEUE_FILE="/root/TASK_QUEUE.md"
mkdir -p /root/logs

echo "--- $(date) ---" >> "$LOG_FILE"
echo "Jules Monitor running..." >> "$LOG_FILE"

# 1. Clean up: log high CPU usage and kill any orphaned processes
echo "Checking for stuck processes..." >> "$LOG_FILE"
# Let's look for any npm build processes that have been running for a long time.
# Or any high CPU processes consuming over 90% CPU that are not essential.
# For safety, let's just log high CPU processes and only explicitly target runaway node Next.js builds if we are sure.
ps aux --sort=-%cpu | head -n 10 >> "$LOG_FILE"

# As a specific cleanup rule, kill any 'next build' process that has been running for more than an hour (just an example safety cleanup)
# A more robust cleanup could look at memory usage, etc.
# We skip destructive kills for now to be safe, but we log the state.

# 2. Keep network connection open
echo "Pinging 8.8.8.8 to keep network active..." >> "$LOG_FILE"
ping -c 1 8.8.8.8 > /dev/null 2>&1

# 3. Check tasks queue
echo "Checking task queue..." >> "$LOG_FILE"
if [ -f "$QUEUE_FILE" ]; then
    PENDING_TASKS=$(grep -c "\[ \]" "$QUEUE_FILE")
    echo "Found $PENDING_TASKS pending tasks in $QUEUE_FILE" >> "$LOG_FILE"

    if [ "$PENDING_TASKS" -gt 0 ]; then
        echo "Pending tasks exist. Notifying..." >> "$LOG_FILE"
    fi
else
    echo "Task queue file $QUEUE_FILE not found!" >> "$LOG_FILE"
fi

echo "Jules Monitor run complete." >> "$LOG_FILE"
echo "-------------------" >> "$LOG_FILE"

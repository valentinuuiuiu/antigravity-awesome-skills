#!/bin/bash
# Install the cron job
mkdir -p /root/scripts
cp "$(dirname "$0")/jules_monitor.sh" /root/scripts/jules_monitor.sh
chmod +x /root/scripts/jules_monitor.sh

# Add to crontab if not already there
crontab -l | grep -q 'jules_monitor.sh' || (crontab -l; echo '*/5 * * * * /root/scripts/jules_monitor.sh') | crontab -
echo "Cron job installed."

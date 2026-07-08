#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev -p 3000 2>/tmp/nt.log
  echo "Server crashed, restarting in 2s..." >> /tmp/nt.log
  sleep 2
done

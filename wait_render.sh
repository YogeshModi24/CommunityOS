#!/bin/bash
for i in {1..20}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://communityos-0d4d.onrender.com/health)
  if [ "$STATUS" = "200" ]; then
    echo "Render is UP!"
    break
  fi
  echo "Render status: $STATUS"
  sleep 15
done

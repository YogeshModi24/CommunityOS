#!/bin/bash
for i in {1..20}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://community-os-web-seven.vercel.app/api/auth/session)
  if [ "$STATUS" = "200" ]; then
    echo "Vercel is UP!"
    break
  fi
  echo "Vercel status: $STATUS"
  sleep 15
done

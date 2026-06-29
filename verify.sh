#!/bin/bash
echo "Waiting for Render to be healthy..."
while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://communityos-0d4d.onrender.com/health)
  if [ "$STATUS" = "200" ]; then
    echo "Render is UP!"
    break
  fi
  echo "Render status: $STATUS"
  sleep 15
done

echo "Waiting for Vercel Auth to return 200 (or at least not 500/400)..."
while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://community-os-web-seven.vercel.app/api/auth/session)
  if [ "$STATUS" = "200" ]; then
    echo "Vercel is UP!"
    break
  fi
  echo "Vercel status: $STATUS"
  sleep 15
done

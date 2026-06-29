#!/bin/bash
echo "Waiting for Render to be healthy..."
for i in {1..20}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://communityos-0d4d.onrender.com/health)
  if [ "$STATUS" = "200" ]; then
    echo "Render is UP!"
    break
  fi
  echo "Render status: $STATUS"
  sleep 20
done

echo "Waiting for Vercel Auth to return 200..."
for i in {1..20}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://community-os-web-seven.vercel.app/api/auth/session)
  if [ "$STATUS" = "200" ]; then
    echo "Vercel is UP!"
    break
  fi
  echo "Vercel status: $STATUS"
  sleep 20
done

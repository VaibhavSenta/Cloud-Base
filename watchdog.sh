#!/usr/bin/env bash
# Copyright (c) 2026 Vaibhav Senta. All Rights Reserved.

# Simple watchdog to keep both Frontend (admin-portal) and Backend (admin-api) dev servers running.
# If either process exits, it will be restarted.

# Function to start a server and wait for it to exit
run_server() {
  local name=$1
  local dir=$2
  local cmd=$3

  while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting $name..."
    # Run the command in the given directory
    (cd "$dir" && $cmd)
    # If we reach here, the process exited
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $name stopped. Restarting in 2 seconds..."
    sleep 2
done
}

# Run both servers in background
run_server "Admin Portal" "$(pwd)/apps/admin-portal" "npm run dev" &
run_server "Admin API" "$(pwd)/services/admin-api" "npm run dev" &

# Wait for both background watcher loops (they never exit)
wait

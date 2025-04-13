#!/bin/bash

# Find the process ID (PID) using lsof
PID=$(lsof -t -sTCP:LISTEN -i :4242)

# Check if PID exists
if [ -n "$PID" ]; then
    echo "Killing process $PID on port 4242"
    kill -9 $PID
fi
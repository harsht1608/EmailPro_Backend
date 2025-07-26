#!/bin/bash

# Start Main server
echo "Starting Main_server..."
cd Main_server && npm install &
PID1=$!
wait $PID1
node server.js &

# Start secondary server
echo "Starting src server..."
cd ../src && npm install &
PID2=$!
wait $PID2
npm start &

echo "Both servers started."
# Keep script running
wait
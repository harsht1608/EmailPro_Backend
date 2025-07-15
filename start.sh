#!/bin/bash

# Start Main server
cd Main_server && npm install &
PID1=$!
wait $PID1
node server.js &

# Start secondary server
cd ../src && npm install &
PID2=$!
wait $PID2
npm start &

# Keep script running
wait
#!/bin/sh
set -e

# delete stale pids
if [ -f tmp/pids/server.pid ]; then
  rm tmp/pids/server.pid
fi

# replace the existing process with the command specified as 
# an argument
exec "$@"

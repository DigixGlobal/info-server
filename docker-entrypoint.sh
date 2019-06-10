#!/bin/bash

sleep 120

cd /usr/src/info-server
rm -rf package-lock.json
rm -rf node_modules/
npm install

./node_modules/.bin/pm2 start development.config.js
tail -f out.log

# Execute the given or default command:
exec "$@"

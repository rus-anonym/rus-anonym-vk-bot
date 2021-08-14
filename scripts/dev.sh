#! /bin/bash
npm run build
pm2 stop ./dist/main.js > /dev/null
pm2 start ./dist/main.js --name="UserBot" > /dev/null
#! /bin/bash
npm run build
pm2 stop ./dist/main.js > /dev/null
NODE_ENV=development pm2 start ./dist/main.js --name="UserBot" --update-env > /dev/null
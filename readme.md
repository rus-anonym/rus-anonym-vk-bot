# User VK bot

# Bot for VK on [**Node.JS**](https://nodejs.org/en/download/)

## The bot is made to simplify the work in the VK dialogues.

## Installation [Manual]

```bash
# Delete package-lock.json
$ rm package-lock.json

# Install dependencies
$ npm install
# Or
$ yarn add
```

This command should install **mime-type**, **moment**, **rus-anonym-utils**, **simple-scheduler-task**, **vk-io**, and **vk-io-question** libraries.

- _We are deleting `package-lock.json` before running `npm install` to fix npm errors failing to install git dependencies._
  - _You can also use `npm ci` and it will work too._

## Installation [Auto]

```bash
# Install dependencies
$ npm
# Or
$ yarn
```

## Script setup

### You must create a config.json file in the ./src/DB directory with the following parameters

```json
{
	"vk": {
		"user": {
			"token": "Token from your page",
			"id": "Your page's numerical identifier"
		},
		"group": {
			"token": "Token group from which notifications will be received",
			"id": "Group numeric identifier"
		},
		"logs": {
			"conversations": {
				"errors": "Chat (group) ID to which notifications will be received",
				"rest": "Chat (group) ID to which notifications will be received",
				"messages": "Chat (group) ID to which notifications will be received",
				"conversations": "Chat (group) ID to which notifications will be received"
			}
		}
	},
	"stels": {
		"enable": false,
		"mode": "bomb",
		"messages": [],
		"exception": []
	},
	"censoringWord": [
		"vto.pe",
		"@all",
		"@everyone",
		"@тут",
		"@все",
		"@здесь",
		"@here",
		"@online"
	]
}
```

## Project build

To assemble a project, use

```bash
$ yarn build
# Or
$ npm build
```

## Project launch

To start a project, use

```bash
$ node ./out/main.js
```

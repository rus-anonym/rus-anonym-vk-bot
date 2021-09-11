# User VK bot

# Bot for VK on [Node.JS](https://nodejs.org/en/download/)

## The bot is made to simplify the work in the VK dialogues

## Installation

```bash
# Install dependencies
$ npm install --legacy-peer-deps
# Or
$ yarn
```

## Script setup

### You must create a config.json file in the ./src/DB directory with the following parameters

```jsonc
{
	"VK": {
		"user": {
			"master": {
				"id": 0, // User ID
				"login": "", // User Login
				"password": "", // User Password
				"tokens": {
					"main": "", // User token for polling
					"additional": [], // Array with user tokens (minimum 1)
					"apps": {
						"6146827": "" // Token from VK Me
					}
				}, // User Tokens
				"friends": {
					"list": {
						"viewOnline": [] // array with the IDs of the lists of friends who can see online
					}
				}
			}, // User Master
			"slave": {
				"id": 0, // User ID
				"login": "", // User Login
				"password": "", // User Password
				"tokens": {
					"main": "", // User token for polling
					"additional": [], // Array with user tokens (minimum 1)
					"apps": {
						"6146827": "" // Token from VK Me
					}
				} // User Tokens
			} // User Slave
		},
		"userFakes": [
			{
				"id": 0, // Fake user ID
				"tokens": [] // Array with tokens from a fake user
			}
		], // Array with fake users
		"group": {
			"id": 0, // Group ID
			"tokens": {
				"main": "", // Group token for polling
				"additional": [] // Array with group tokens (minimum 1)
			}, // Group Tokens
			"logs": {
				"conversations": {
					"messages": 0,
					"conversations": 0,
					"rest": 0,
					"errors": 0,
					"friends_activity": 0,
					"info": 0,
					"userTrack": 0,
					"captcha": 0,
					"api": 0
				} // Conversation identifiers, for the group bot
			},
			"conversations": [] // Array of chatIDs of group conversations
		}, // Group
		"groupReposts": {
			"tokens": [], // Array of group tokens for repost
			"chats": [] // Peer ID of chats for repost from slave account
		}
	},
	"DBMS": {
		"mongo": {
			"login": "", // Mongo DB login
			"password": "", // Mongo DB password
			"address": "", // Adress to MongoDB
			"database": {
				"user": {
					"name": "" // UserBot database name
				},
				"group": {
					"name": "" // GroupBot database name
				},
				"main": {
					"name": "" // Main database name
				}
			}
		}
	},
	"rucaptcha": {
		"token": "" // RuCaptcha token
	}
}
```

## Project build

To assemble a project, use

```bash
yarn build
# Or
npm run build
```

## Project launch

To start a project, use

```bash
node ./dist/main.js
```

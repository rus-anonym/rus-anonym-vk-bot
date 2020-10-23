import { commandsList } from "./types";
import utils from "rus-anonym-utils";
import fs from "fs";
import moment from "moment";

moment.locale(`ru`);

const userCommands: Array<commandsList> = [];

const groupCommands: Array<commandsList> = [];

const config: {
	userToken: string;
	userID: number;
	groupToken: string;
	groupID: number;
} = require(`../DB/config.json`);

async function loadCommands() {
	await utils.logger.console(`Loading user commands...`);
	let arrayWithUserCommands = fs.readdirSync("./commands/user");
	for (let userCommand in arrayWithUserCommands) {
		let tempScript = require(`../commands/user/${userCommand}`);
		userCommands.push({
			regexp: tempScript.regexp,
			process: tempScript.process,
		});
	}
	await utils.logger.console(
		`Successfull loading user commands (${userCommands.length})`,
	);
	await utils.logger.console(`Loading group commands...`);
	let arrayWithGroupCommands = fs.readdirSync("./commands/group");
	for (let groupCommand in arrayWithGroupCommands) {
		let tempScript = require(`../commands/group/${groupCommand}`);
		groupCommands.push({
			regexp: tempScript.regexp,
			process: tempScript.process,
		});
	}
	await utils.logger.console(
		`Successfull loading group commands (${groupCommands.length})`,
	);
}
export { loadCommands, config, userCommands, groupCommands };

import utils from "rus-anonym-utils";
import fs from "fs";
import scheduler from "simple-scheduler-task";
import moment from "moment";

moment.locale(`ru`);

const userCommands: Array<{
	regexp: RegExp;
	process: Function;
}> = [];

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
}
export { loadCommands, config, userCommands };

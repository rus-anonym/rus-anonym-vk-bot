/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import ICommand from "../types/interfaces/commands";
import * as utils from "rus-anonym-utils";

const userCommands: ICommand[] = [];
const groupCommands: ICommand[] = [];

function parseCommand(path: string): ICommand {
	delete require.cache[require.resolve(path)];
	let script = require(path);
	script.default ? (script = script.default) : null;
	const outputData = {
		regexp: script.regexp,
		process: script.process,
	};
	return outputData;
}

function loadUserCommands(path: string): void {
	const folderElements = fs.readdirSync(path);
	folderElements.map((element) => {
		const elementPath = path + "/" + element;
		if (fs.statSync(elementPath).isDirectory()) {
			return loadUserCommands(elementPath);
		} else {
			userCommands.push(parseCommand("." + elementPath));
		}
	});
	return;
}

function loadGroupCommands(path: string): void {
	const folderElements = fs.readdirSync(path);
	folderElements.map((element) => {
		const elementPath = path + "/" + element;
		if (fs.statSync(elementPath).isDirectory()) {
			return loadGroupCommands(elementPath);
		} else {
			groupCommands.push(parseCommand("." + elementPath));
		}
	});
	return;
}

function loadCommands(): void {
	utils.logger.info(`Loading commands...`);
	loadUserCommands("./commands/user");
	loadGroupCommands("./commands/group");
	utils.logger.info(
		`Succesfull load commands: (Group: ${groupCommands.length} | User: ${userCommands.length})`,
	);
}

export default { userCommands, groupCommands, loadCommands };

import { ModernMessageContext } from "./types";
import utils from "rus-anonym-utils";
import fs from "fs";
import { VK, MessageContext, IMessageContextSendOptions } from "vk-io";
import scheduler from "simple-scheduler-task";
import moment from "moment";
import { processMessage } from "./utils";

moment.locale(`ru`);

const commands: Array<{
	regexp: RegExp;
	process: Function;
}> = [];

const config: {
	token: string;
} = require(`../DB/config.json`);

const vk = new VK({
	token: config.token,
	apiMode: "parallel",
	apiVersion: "5.130",
});

vk.updates.use(async (message: ModernMessageContext) => {
	message = await processMessage(message);
	if (!message) {
		return;
	}
	message.sendMessage = async (
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>> => {
		try {
			let params_for_send = Object.assign({ disable_mentions: true }, params);
			return await message.send(
				`@id${message.senderId}, ${text}`,
				params_for_send,
			);
		} catch (error) {
			console.log(error);
			return error;
		}
	};

	let command = commands.find((x) => x.regexp.test(message.text || ""));
	if (!command) {
		return;
	}
	if (message.text) {
		message.args = await message.text.match(command.regexp);
	}
	try {
		await command.process(message);
		return;
	} catch (err) {
		await message.sendMessage(`ошиб очка.`);
		await message.send({
			sticker_id: await utils.array.random([18464, 16588, 18466, 18484, 14088]),
		});
		console.log(err);
		return;
	}
});

async function main() {
	await utils.logger.console(`Loading commands...`);
	let arrayWithCommands = fs.readdirSync("./commands");
	for (let i in arrayWithCommands) {
		let tempScript = require(`../commands/${arrayWithCommands[i]}`);
		commands.push({
			regexp: tempScript.regexp,
			process: tempScript.process,
		});
	}
	await utils.logger.console(
		`Successfull loading commands (${commands.length})`,
	);
	await utils.logger.console(`Connect to VK LongPoll...`);
	await vk.updates.startPolling();
	await utils.logger.console(`Successfull connection to VK LongPoll`);
	await utils.logger.console(`Beginning task scheduling...`);
	await scheduler.tasks.add({
		isInterval: true,
		intervalTimer: 5 * 60 * 1000,
		code: async function () {
			//
		},
	});
	await utils.logger.console(`Tasks are planned`);
	await utils.logger.console(`Script start`);
}
export { main, vk };

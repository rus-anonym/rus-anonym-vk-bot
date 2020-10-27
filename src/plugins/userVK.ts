import { groupLogger } from "./logger";
import { config, userCommands } from "./core";
import { ModernUserMessageContext } from "./types";
import { VK, MessageContext, IMessageContextSendOptions } from "vk-io";
import utils from "rus-anonym-utils";
import { DB } from "./db";

const userVK = new VK({
	token: config.vk.user.token,
	apiMode: "parallel",
	apiVersion: "5.130",
});

async function filterTypes(message: ModernUserMessageContext) {
	let arrayWithBlockedTypes: Array<string> = [`messages_read`, `typing`];
	let arrayWithBlockedSubTypes: Array<string> = [
		`friend_online`,
		`friend_offline`,
	];
	for (let blockedType of arrayWithBlockedTypes) {
		if (message.type === blockedType) {
			return true;
		}
	}
	for (let blockedSubType of arrayWithBlockedSubTypes) {
		if (message.subTypes.find((x) => x === blockedSubType)) {
			return true;
		}
	}
	return false;
}

async function filterWords(text: string) {
	for (let i in config.censoringWord) {
		text.replace(new RegExp(config.censoringWord[i], `gi`), `*censored*`);
	}
	return text;
}

userVK.updates.use(async (message: ModernUserMessageContext) => {
	if (
		(await filterTypes(message)) === true ||
		message.senderId === -config.vk.group.id
	) {
		return;
	}

	if (message.text) {
		message.text = await filterWords(message.text);
	}

	if (message.isOutbox === true) {
		return;
	}

	if (message.flags === 131200) {
		let checkSaveMessage = await DB.messages.exist(message.id);
		if (checkSaveMessage) {
			let oldMessage = await DB.messages.get(message.id);
			console.log(oldMessage);
		}
	}

	let messageData = (
		await userVK.api.messages.getById({
			message_ids: message.id,
		})
	).items[0];

	try {
		await DB.messages.save(message.id, {
			message: message,
			messageFullData: messageData,
		});
	} catch (error) {
		await groupLogger.logInErrorLogs(
			`Error on save message #${message.id}\nError: ${error.name}\n\nError Data: ${error.message}`,
		);
	}

	// let command = userCommands.find((x) => x.regexp.test(message.text || ""));
	// if (!command) {
	// 	return;
	// }
	// message.sendMessage = async (
	// 	text: string | IMessageContextSendOptions,
	// 	params?: IMessageContextSendOptions | undefined,
	// ): Promise<MessageContext<Record<string, any>>> => {
	// 	try {
	// 		let paramsForSend = Object.assign({ disable_mentions: true }, params);
	// 		return await message.send(
	// 			`@id${message.senderId}, ${text}`,
	// 			paramsForSend,
	// 		);
	// 	} catch (error) {
	// 		console.log(error);
	// 		return error;
	// 	}
	// };
	// if (message.text) {
	// 	message.args = message.text.match(command.regexp);
	// }
	// try {
	// 	await command.process(message);
	// 	return;
	// } catch (err) {
	// 	await message.sendMessage(`ошиб очка.`);
	// 	await message.send({
	// 		sticker_id: await utils.array.random([18464, 16588, 18466, 18484, 14088]),
	// 	});
	// 	console.log(err);
	// 	return;
	// }
});

export { userVK };

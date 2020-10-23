import { config, userCommands } from "./core";
import { ModernUserMessageContext } from "./types";
import { processUserMessage } from "./utils";
import { VK, MessageContext, IMessageContextSendOptions } from "vk-io";
import utils from "rus-anonym-utils";

const userVK = new VK({
	token: config.vk.user.token,
	apiMode: "parallel",
	apiVersion: "5.130",
});

userVK.updates.use(async (message: ModernUserMessageContext) => {
	message = await processUserMessage(message);
	if (!message) {
		return;
	}
	message.sendMessage = async (
		text: string | IMessageContextSendOptions,
		params?: IMessageContextSendOptions | undefined,
	): Promise<MessageContext<Record<string, any>>> => {
		try {
			let paramsForSend = Object.assign({ disable_mentions: true }, params);
			return await message.send(
				`@id${message.senderId}, ${text}`,
				paramsForSend,
			);
		} catch (error) {
			console.log(error);
			return error;
		}
	};

	let command = userCommands.find((x) => x.regexp.test(message.text || ""));
	if (!command) {
		return;
	}
	if (message.text) {
		message.args = message.text.match(command.regexp);
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

export { userVK };

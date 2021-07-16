import moment from "moment";

import { UserCommand } from "../../../utils/lib/commands";
import InternalUtils from "../../../utils/core";

new UserCommand(/(?:^!invite|!add)(?:\s(.*))?$/i, async function (message, vk) {
	if (!message.isChat) {
		return message.editMessage({
			message: "Работает только в беседах",
		});
	}

	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.editMessage({
			message: error.message,
		});
	}

	try {
		await vk.api.messages.addChatUser({
			chat_id: message.chatId as number,
			user_id: userID,
		});
		await message.editMessage({
			message: `https://vk.com/id${userID} добавлен в беседу в ${moment().format(
				"HH:mm:ss",
			)}`,
		});
	} catch (error) {
		return message.editMessage({
			message: `Не могу пригласить https://vk.com/id${userID} в беседу\n${error.message}`,
		});
	}
});

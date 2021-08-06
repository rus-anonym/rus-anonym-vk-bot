import moment from "moment";

import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtils from "../../../../utils/core";
import VK from "../../../../VK/core";

new UserCommand(/(?:^!kick)(?:\s(.*))?$/i, async function (message, vk) {
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

	if (userID > 0) {
		try {
			await vk.api.messages.removeChatUser({
				chat_id: message.chatId as number,
				user_id: userID,
			});
			await message.editMessage({
				message: `https://vk.com/id${userID} исключён из беседы в ${moment().format(
					"HH:mm:ss",
				)}`,
			});
		} catch (error) {
			return message.editMessage({
				message: `Не могу исключить пользователя https://vk.com/id${userID} из беседы\n${error.message}`,
			});
		}
	} else {
		await message.editMessage({
			message: "Проверяю токен от BotPod",
		});
		const isValid = await VK.user.botpod.check();
		if (!isValid) {
			await message.editMessage({
				message: "Обновляю токен от BotPod",
			});
			await VK.user.botpod.update();
		}
		try {
			await VK.user.botpod.kickBot(message.peerId, userID);
			return message.editMessage({
				message: `https://vk.com/club${-userID} исключён из беседы в ${moment().format(
					"HH:mm:ss",
				)}`,
			});
		} catch (error) {
			return message.editMessage({
				message: `Не могу исключить https://vk.com/club${-userID} из беседу\n${
					error.message
				}`,
			});
		}
	}
});

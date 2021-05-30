import { resolveResource } from "vk-io";
import { Command } from "../../../utils/lib/command";

new Command(/(?:^!kick)(?:\s(.*))?$/i, async function (message, vk) {
	if (!message.isChat) {
		return message.editMessage({
			message: "Работает только в беседах",
		});
	}

	await message.loadMessagePayload();
	let userID;
	if (message.forwards[0]) {
		userID = message.forwards[0].senderId;
	} else if (message.replyMessage) {
		userID = message.replyMessage.senderId;
	} else if (message.args[1]) {
		try {
			const linkData = await resolveResource({
				resource: message.args[1],
				api: vk.api,
			});
			userID = linkData.id;
		} catch (error) {
			return await message.editMessage({
				message: "Не смог распознать ссылку",
			});
		}
	} else {
		return await message.editMessage({
			message: "Не смог распознать ссылку",
		});
	}

	try {
		await vk.api.messages.removeChatUser({
			chat_id: message.chatId as number,
			user_id: userID,
		});
		await message.deleteMessage({ delete_for_all: true });
	} catch (error) {
		return message.editMessage({
			message: "Не могу исключить",
		});
	}
});

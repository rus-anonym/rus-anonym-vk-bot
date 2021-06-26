import { getRandomId } from "vk-io";
import moment from "moment";

import DB from "../../DB/core";
import VK from "../../VK/core";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";

type Log = "message" | "conversation" | "rest" | "error" | "friend_activity";
export default class UtilsLogger {
	public async send(
		message: string,
		type: Log = "rest",
		params: MessagesSendParams = {},
	): Promise<void> {
		let selectedChat;
		let prefix;

		switch (type) {
			case "message":
				selectedChat = DB.config.vk.group.logs.conversations.messages;
				prefix = "🆗";
				break;
			case "conversation":
				selectedChat = DB.config.vk.group.logs.conversations.conversations;
				prefix = "🆗";
				break;
			case "rest":
				selectedChat = DB.config.vk.group.logs.conversations.rest;
				prefix = "⚠";
				break;
			case "friend_activity":
				selectedChat = DB.config.vk.group.logs.conversations.friends_activity;
				prefix = "⚠";
				break;
			case "error":
				selectedChat = DB.config.vk.group.logs.conversations.errors;
				prefix = "⛔";
				break;
			default:
				selectedChat = DB.config.vk.group.logs.conversations.errors;
				prefix = "⛔";
				break;
		}

		message = `Log: ${moment().format("HH:mm:ss.SSS | DD.MM.YYYY")}\n
${prefix} - ${message}`;

		message += "\n\n";

		message += `🔴🔴🔴🔴🔴🔴🔴🔴`;

		await VK.group.getVK().api.messages.send(
			Object.assign(
				{
					chat_id: selectedChat,
					random_id: getRandomId(),
					message: message,
					disable_mentions: true,
				},
				params,
			),
		);

		return;
	}
}

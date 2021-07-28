import { getRandomId } from "vk-io";
import moment from "moment";

import DB from "../../DB/core";
import VK from "../../VK/core";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";

type Log =
	| "message"
	| "conversation"
	| "rest"
	| "error"
	| "friend_activity"
	| "info"
	| "user_track"
	| "captcha";
export default class UtilsLogger {
	public async send({
		message,
		type = "rest",
		params = {},
	}: {
		message: string;
		type?: Log;
		params?: MessagesSendParams;
	}): Promise<void> {
		let selectedChat;
		let prefix;

		switch (type) {
			case "message":
				selectedChat = DB.config.VK.group.logs.conversations.messages;
				prefix = "🆗";
				break;
			case "conversation":
				selectedChat = DB.config.VK.group.logs.conversations.conversations;
				prefix = "🆗";
				break;
			case "rest":
				selectedChat = DB.config.VK.group.logs.conversations.rest;
				prefix = "⚠";
				break;
			case "info":
				selectedChat = DB.config.VK.group.logs.conversations.info;
				prefix = "ℹ";
				break;
			case "user_track":
				selectedChat = DB.config.VK.group.logs.conversations.userTrack;
				prefix = "ℹ";
				break;
			case "captcha":
				selectedChat = DB.config.VK.group.logs.conversations.captcha;
				prefix = "ℹ";
				break;
			case "friend_activity":
				selectedChat = DB.config.VK.group.logs.conversations.friends_activity;
				prefix = "⚠";
				break;
			case "error":
				selectedChat = DB.config.VK.group.logs.conversations.errors;
				prefix = "⛔";
				break;
			default:
				selectedChat = DB.config.VK.group.logs.conversations.errors;
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

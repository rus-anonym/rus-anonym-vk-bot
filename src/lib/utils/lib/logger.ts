import { getRandomId } from "vk-io";
import moment from "moment";

import DB from "../../DB/core";
import VK from "../../VK/core";

type Log = "message" | "conversation" | "rest" | "error";
export default class UtilsLogger {
	public async send(message: string, type: Log = "rest"): Promise<void> {
		let selectedChat;
		let prefix;

		switch (type) {
			case "message":
				selectedChat = DB.config.vk.logs.conversations.messages;
				prefix = "🆗";
				break;
			case "conversation":
				selectedChat = DB.config.vk.logs.conversations.conversations;
				prefix = "🆗";
				break;
			case "rest":
				selectedChat = DB.config.vk.logs.conversations.rest;
				prefix = "⚠";
				break;
			case "error":
				selectedChat = DB.config.vk.logs.conversations.errors;
				prefix = "⛔";
				break;
			default:
				selectedChat = DB.config.vk.logs.conversations.errors;
				prefix = "⛔";
				break;
		}

		message = `Log: ${moment().format("HH:mm:ss.SSS | DD.MM.YYYY")}\n
${prefix} - ${message}`;

		message += "\n\n";

		message += `🔴🔴🔴🔴🔴🔴🔴🔴`;

		await VK.group.getVK().api.messages.send({
			chat_id: selectedChat,
			random_id: getRandomId(),
			message: message,
		});

		return;
	}
}

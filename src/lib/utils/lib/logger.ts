import { getRandomId } from "vk-io";
import DB from "../../DB/core";
import VK from "../../VK/core";

type Log = "message" | "conversation" | "rest" | "error";
export default class Logger {
	public send(message: string, type: Log = "rest") {
		let selectedChat;

		switch (type) {
			case "message":
				selectedChat = DB.config.vk.logs.conversations.messages;
			case "conversation":
				selectedChat = DB.config.vk.logs.conversations.conversations;
			case "rest":
				selectedChat = DB.config.vk.logs.conversations.rest;
			case "error":
				selectedChat = DB.config.vk.logs.conversations.errors;
			default:
				selectedChat = DB.config.vk.logs.conversations.errors;
		}

		return VK.group.getVK().api.messages.send({
			chat_id: selectedChat,
			random_id: getRandomId(),
			message: message,
		});
	}
}

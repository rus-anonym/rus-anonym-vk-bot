import { getRandomId } from "vk-io";
import DB from "../../DB/core";
import VK from "../../VK/core";

export default class Logger {
	public send(message: string) {
		return VK.group.getVK().api.messages.send({
			chat_id: DB.config.vk.logs.conversations.rest,
			random_id: getRandomId(),
			message: message,
		});
	}
}

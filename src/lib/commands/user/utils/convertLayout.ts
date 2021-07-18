import ru from "convert-layout/ru";

import { UserCommand } from "../../../utils/lib/commands";

import DB from "../../../DB/core";
import VK from "../../../VK/core";

new UserCommand(/(?:^!tr)$/i, async function (message) {
	if (message.hasReplyMessage && message.replyMessage) {
		await message.loadMessagePayload();
		if (
			message.replyMessage.senderId === DB.config.VK.user.id &&
			message.replyMessage.text
		) {
			return await VK.user.getVK().api.messages.edit({
				message_id: message.replyMessage.id,
				peer_id: message.replyMessage.peerId,
				keep_forward_messages: true,
				keep_snippets: true,
				dont_parse_links: true,
				message: ru.fromEn(message.replyMessage.text || "Нет текста"),
			});
		} else {
			return await message.editMessage({
				message: ru.fromEn(message.replyMessage.text || "Нет текста"),
			});
		}
	} else {
		return await message.editMessage({
			message: `Нет отвеченного сообщения`,
		});
	}
});

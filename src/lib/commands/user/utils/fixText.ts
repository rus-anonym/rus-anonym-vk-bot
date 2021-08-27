import axios from "axios";

import { UserCommand } from "../../../utils/lib/commands/core";

import DB from "../../../DB/core";
import VK from "../../../VK/core";

const fixText = async (text: string): Promise<string> => {
	const response = await axios({
		url: "https://speller.yandex.net/services/spellservice.json/checkText",
		method: "POST",
		data: `text=${text}&lang=ru`,
	});

	for (const item of response.data) {
		text = text.replace(item.word, item.s[0]);
	}

	return text;
};

new UserCommand(/(?:^!fixText)$/i, async function (message) {
	if (message.hasReplyMessage && message.replyMessage) {
		await message.loadMessagePayload();
		if (message.replyMessage.senderId === DB.config.VK.user.id) {
			return await VK.user.getVK().api.messages.edit({
				message_id: message.replyMessage.id,
				peer_id: message.replyMessage.peerId,
				keep_forward_messages: true,
				keep_snippets: true,
				dont_parse_links: true,
				attachment: message.replyMessage.attachments
					.map((x) => x.toString())
					.join(),
				message: await fixText(message.replyMessage.text || "Нет текста"),
			});
		} else {
			return await message.editMessage({
				message: await fixText(message.replyMessage.text || "Нет текста"),
			});
		}
	} else {
		return await message.editMessage({
			message: `Нет отвеченного сообщения`,
		});
	}
});

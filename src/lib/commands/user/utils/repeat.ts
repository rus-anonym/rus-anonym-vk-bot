import { getRandomId } from "vk-io";

import VK from "../../../VK/core";
import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!repeat)(?:\s(\d+))?(\strue)?$/i, async function (
	message,
) {
	message.state.args[1] = message.state.args[1] || "1";
	if (!Number(message.state.args[1])) {
		message.state.args[1] = "1";
	}
	if (Number(message.state.args[1]) > 100) {
		return await message.editMessage({
			message: `Limit: 100`,
		});
	}
	await message.loadMessagePayload();
	const params: Record<string, string | number> = {};
	if (message.replyMessage) {
		if (message.replyMessage.text) {
			params.message = message.replyMessage?.text;
		}
		if (message.replyMessage.hasAttachments("sticker")) {
			params.sticker_id = message.replyMessage.getAttachments("sticker")[0].id;
		} else {
			params.attachment = message.replyMessage.attachments
				.map((x) => x.toString())
				.join();
		}
	}
	if (Object.keys(params).length === 0) {
		return await message.editMessage({
			message: `Не обнаружено свойств`,
		});
	}
	await message.deleteMessage({
		delete_for_all: true,
	});
	const isForce = Boolean(message.state.args[2]);
	if (isForce) {
		const promises = [];
		for (let i = 0; i < Number(message.state.args[1]); ++i) {
			promises.push(
				VK.user.getVK().api.messages.send({
					peer_id: message.peerId,
					random_id: getRandomId(),
					...params,
				}),
			);
		}
		await Promise.all(promises);
	} else {
		for (let i = 0; i < Number(message.state.args[1]); ++i) {
			await VK.user.getVK().api.messages.send({
				peer_id: message.peerId,
				random_id: getRandomId(),
				...params,
			});
		}
	}
});

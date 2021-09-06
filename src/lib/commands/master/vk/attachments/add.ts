/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MessageContext } from "vk-io";

import { UserCommand } from "../../../../utils/lib/commands/core";
import VK from "../../../../VK/core";

const add = async (message: MessageContext): Promise<string> => {
	let log = "";
	for (const audio of message.getAttachments("audio")) {
		try {
			await VK.master.getVK().api.call("audio.add", {
				audio_id: audio.id,
				owner_id: audio.ownerId,
			});
			log += `Добавил трек ${audio.title} - ${audio.artist}\n`;
		} catch (error) {
			log += `Ошибка добавления ${audio.title} (${error.message})`;
		}
	}
	for (const doc of message.getAttachments("doc")) {
		try {
			await VK.master.getVK().api.docs.add({
				owner_id: doc.ownerId,
				doc_id: doc.id,
				access_key: doc.accessKey,
			});
			log += `Добавил ${doc.title}`;
		} catch (error) {
			log += `Ошибка добавления ${doc.title} (${error.message})`;
		}
	}
	return log === "" ? `Не нашёл что нужно добавить` : log;
};

new UserCommand(/(?:^!add)$/i, async function (context) {
	await context.loadMessagePayload();

	if (context.hasReplyMessage) {
		return await context.editMessage({
			message: await add(context.replyMessage!),
		});
	}

	if (context.hasForwards) {
		let message = "";
		for (const forward of context.forwards) {
			message += await add(forward);
		}
		return await context.editMessage({
			message,
		});
	}

	return await context.editMessage({
		message: `Не нашёл прикреплений`,
	});
});

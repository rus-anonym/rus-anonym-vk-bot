import { MessageContext } from "vk-io";
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { UserCommand } from "../../../utils/lib/commands";
import VK from "../../../VK/core";

const add = async (message: MessageContext): Promise<string> => {
	let log = "";
	for (const audio of message.getAttachments("audio")) {
		await VK.user.getVK().api.call("audio.add", {
			audio_id: audio.id,
			owner_id: audio.ownerId,
		});
		log += `Добавил трек ${audio.title} - ${audio.artist}\n`;
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
		return await context.editMessage({
			message: await add(context.forwards[0]!),
		});
	}

	return await context.editMessage({
		message: `Не нашёл прикреплений`,
	});
});

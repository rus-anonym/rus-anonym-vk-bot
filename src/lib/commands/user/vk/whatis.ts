import { MessageContext } from "vk-io";
import { Command } from "../../../utils/lib/command";

const AttachmentsToString = async (
	message: MessageContext,
): Promise<string> => {
	let text = ``;
	let i = 0;
	text += message
		.getAttachments(`sticker`)
		.map((sticker) => {
			++i;
			return `${i}. Sticker 
ID: ${sticker.id}
Pack ID: ${sticker.productId}`;
		})
		.join(`\n\n`);
	return text;
};

new Command(/(?:^!whatis)$/i, async function (message) {
	await message.loadMessagePayload();

	if (message.forwards[0] && message.forwards[0].hasAttachments()) {
		return message.editMessage({
			message: `
Прикрепления:
${await AttachmentsToString(message.forwards[0])}`,
		});
	}

	if (message.replyMessage?.hasAttachments()) {
		return message.editMessage({
			message: `
Прикрепления:
${await AttachmentsToString(message.replyMessage)}`,
		});
	}

	if (message.hasAttachments()) {
		return message.editMessage({
			message: `
Прикрепления:
${await AttachmentsToString(message)}`,
		});
	}

	return message.editMessage({
		message: `Не нашёл прикреплений`,
	});
});

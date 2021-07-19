import utils from "rus-anonym-utils";
import JIMP from "jimp";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!grayscale)$/i, async function (message, vk) {
	await message.loadMessagePayload();

	if (message.replyMessage?.hasAttachments("sticker")) {
		const source = utils.array.last(
			message.replyMessage.getAttachments("sticker")[0].images,
		);

		const image = await JIMP.read(source.url);
		image.grayscale();

		const graffiti = await vk.upload.messageGraffiti({
			peer_id: message.peerId,
			source: {
				value: await image.getBufferAsync(JIMP.MIME_PNG),
				filename: "sticker.png",
			},
		});

		return await message.reply({
			message: `Серый стикер:`,
			attachment: graffiti.toString(),
		});
	}

	if (message.replyMessage?.hasAttachments("photo")) {
		const source = message.replyMessage.getAttachments("photo")[0].largeSizeUrl;

		const image = await JIMP.read(source as string);
		image.grayscale();

		const photo = await vk.upload.messagePhoto({
			peer_id: message.peerId,
			source: {
				value: await image.getBufferAsync(JIMP.MIME_PNG),
				filename: "sticker.png",
			},
		});

		return await message.reply({
			message: `Серое фото:`,
			attachment: photo.toString(),
		});
	}

	if (message.hasAttachments("photo")) {
		const source = message.getAttachments("photo")[0].largeSizeUrl;

		const image = await JIMP.read(source as string);
		image.grayscale();

		const photo = await vk.upload.messagePhoto({
			peer_id: message.peerId,
			source: {
				value: await image.getBufferAsync(JIMP.MIME_PNG),
				filename: "sticker.png",
			},
		});

		return await message.reply({
			message: `Серое фото:`,
			attachment: photo.toString(),
		});
	}

	return await message.editMessage({
		message: `Не найдено изображение или стикер`,
	});
});

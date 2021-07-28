import utils from "rus-anonym-utils";
import JIMP from "jimp";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand(/(?:^!contrast)(?:\s(.*))?$/i, async function (message, vk) {
	if (message.state.args[1] && !Number(message.state.args[1])) {
		return await message.editMessage({
			message: `${message.state.args[1]} не является числом`,
		});
	}

	if (
		message.state.args[1] &&
		(Number(message.state.args[1]) > 1 || Number(message.state.args[1]) < -1)
	) {
		return await message.editMessage({
			message: `Число должно быть в диапазоне между -1 и 1`,
		});
	}

	const posterizeEffect = message.state.args[1]
		? Number(message.state.args[1])
		: 3;

	await message.loadMessagePayload();

	if (message.replyMessage?.hasAttachments("sticker")) {
		const source = utils.array.last(
			message.replyMessage.getAttachments("sticker")[0].images,
		);

		const image = await JIMP.read(source.url);
		image.posterize(posterizeEffect);

		const graffiti = await vk.upload.messageGraffiti({
			peer_id: message.peerId,
			source: {
				value: await image.getBufferAsync(JIMP.MIME_PNG),
				filename: "sticker.png",
			},
		});

		return await message.reply({
			message: `Стикер в контрасте:`,
			attachment: graffiti.toString(),
		});
	}

	if (message.replyMessage?.hasAttachments("photo")) {
		const source = message.replyMessage.getAttachments("photo")[0].largeSizeUrl;

		const image = await JIMP.read(source as string);
		image.posterize(posterizeEffect);

		const photo = await vk.upload.messagePhoto({
			peer_id: message.peerId,
			source: {
				value: await image.getBufferAsync(JIMP.MIME_PNG),
				filename: "sticker.png",
			},
		});

		return await message.reply({
			message: `Фото в контрасте:`,
			attachment: photo.toString(),
		});
	}

	if (message.hasAttachments("photo")) {
		const source = message.getAttachments("photo")[0].largeSizeUrl;

		const image = await JIMP.read(source as string);
		image.posterize(posterizeEffect);

		const photo = await vk.upload.messagePhoto({
			peer_id: message.peerId,
			source: {
				value: await image.getBufferAsync(JIMP.MIME_PNG),
				filename: "sticker.png",
			},
		});

		return await message.reply({
			message: `Фото в контрасте:`,
			attachment: photo.toString(),
		});
	}

	return await message.editMessage({
		message: `Не найдено изображение или стикер`,
	});
});

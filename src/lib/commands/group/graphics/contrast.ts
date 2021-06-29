import utils from "rus-anonym-utils";
import JIMP from "jimp";

import { GroupCommand } from "../../../utils/lib/commands";
import VK from "../../../VK/core";
import DB from "../../../DB/core";

new GroupCommand(/(?:^\/contrast)(?:\s(.*))?$/i, async function (message, vk) {
	if (message.args[1] && !Number(message.args[1])) {
		return await message.sendMessage({
			message: `${message.args[1]} не является числом`,
		});
	}

	if (
		message.args[1] &&
		(Number(message.args[1]) > 1 || Number(message.args[1]) < -1)
	) {
		return await message.sendMessage({
			message: `Число должно быть в диапазоне между -1 и 1`,
		});
	}

	const posterizeEffect = message.args[1] ? Number(message.args[1]) : 3;

	if (message.replyMessage?.hasAttachments("sticker")) {
		const source = utils.array.last(
			message.replyMessage.getAttachments("sticker")[0].images,
		);

		const image = await JIMP.read(source.url);
		image.posterize(posterizeEffect);

		const graffiti = await VK.user.getVK().upload.documentGraffiti({
			group_id: DB.config.vk.group.id,
			source: {
				value: await image.getBufferAsync(JIMP.MIME_PNG),
				filename: "sticker.png",
			},
		});

		return await message.sendMessage({
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

		return await message.sendMessage({
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

		return await message.sendMessage({
			message: `Фото в контрасте:`,
			attachment: photo.toString(),
		});
	}

	return await message.sendMessage({
		message: `Не найдено изображение или стикер`,
	});
});

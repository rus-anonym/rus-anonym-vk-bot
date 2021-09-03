import utils from "rus-anonym-utils";
import JIMP from "jimp";

import { GroupCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";
import DB from "../../../DB/core";

new GroupCommand({
	regexp: /(?:^\/posterize)(?:\s(.*))?$/i,
	process: async function (message, vk) {
		if (message.state.args[1] && !Number(message.state.args[1])) {
			return await message.editMessage({
				message: `${message.state.args[1]} не является числом`,
			});
		}

		const posterizeEffect = message.state.args[1]
			? Number(message.state.args[1])
			: 3;

		if (message.replyMessage?.hasAttachments("sticker")) {
			const source = utils.array.last(
				message.replyMessage.getAttachments("sticker")[0].images,
			);

			const image = await JIMP.read(source.url);
			image.posterize(posterizeEffect);

			const graffiti = await VK.slave.getVK().upload.documentGraffiti({
				group_id: DB.config.VK.group.id,
				source: {
					value: await image.getBufferAsync(JIMP.MIME_PNG),
					filename: "sticker.png",
				},
			});

			return await message.reply({
				message: `Стикер в постеризации:`,
				attachment: graffiti.toString(),
			});
		}

		if (message.replyMessage?.hasAttachments("photo")) {
			const source =
				message.replyMessage.getAttachments("photo")[0].largeSizeUrl;

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
				message: `Фото в постеризации:`,
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
				message: `Фото в постеризации:`,
				attachment: photo.toString(),
			});
		}

		return await message.editMessage({
			message: `Не найдено изображение или стикер`,
		});
	},
});

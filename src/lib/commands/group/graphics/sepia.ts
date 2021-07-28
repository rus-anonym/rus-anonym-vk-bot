import utils from "rus-anonym-utils";
import JIMP from "jimp";

import { GroupCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";
import DB from "../../../DB/core";

new GroupCommand({
	regexp: /(?:^\/sepia)$/i,
	process: async function (message, vk) {
		if (message.replyMessage?.hasAttachments("sticker")) {
			const source = utils.array.last(
				message.replyMessage.getAttachments("sticker")[0].images,
			);

			const image = await JIMP.read(source.url);
			image.sepia();

			const graffiti = await VK.user.getVK().upload.documentGraffiti({
				group_id: DB.staticConfig.VK.group.id,
				source: {
					value: await image.getBufferAsync(JIMP.MIME_PNG),
					filename: "sticker.png",
				},
			});

			return await message.state.sendMessage({
				message: `Стикер в сепии:`,
				attachment: graffiti.toString(),
			});
		}

		if (message.replyMessage?.hasAttachments("photo")) {
			const source =
				message.replyMessage.getAttachments("photo")[0].largeSizeUrl;

			const image = await JIMP.read(source as string);
			image.sepia();

			const photo = await vk.upload.messagePhoto({
				peer_id: message.peerId,
				source: {
					value: await image.getBufferAsync(JIMP.MIME_PNG),
					filename: "sticker.png",
				},
			});

			return await message.state.sendMessage({
				message: `Фото в сепии:`,
				attachment: photo.toString(),
			});
		}

		if (message.hasAttachments("photo")) {
			const source = message.getAttachments("photo")[0].largeSizeUrl;

			const image = await JIMP.read(source as string);
			image.sepia();

			const photo = await vk.upload.messagePhoto({
				peer_id: message.peerId,
				source: {
					value: await image.getBufferAsync(JIMP.MIME_PNG),
					filename: "sticker.png",
				},
			});

			return await message.state.sendMessage({
				message: `Фото в сепии:`,
				attachment: photo.toString(),
			});
		}

		return await message.state.sendMessage({
			message: `Не найдено изображение или стикер`,
		});
	},
});

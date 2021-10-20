import utils from "rus-anonym-utils";
import JIMP from "jimp";
import gm from "gm";

import { UserCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";
import DB from "../../../DB/core";

const seamCarving = async (source: string, power: number): Promise<Buffer> => {
	const image = await JIMP.read(source);
	const [width, height] = [image.bitmap.width, image.bitmap.height];
	const buffer = await image.getBufferAsync(JIMP.MIME_PNG);

	const imageMagick = gm.subClass({
		imageMagick: true,
	});

	const im = imageMagick(buffer);

	im.command("convert");
	im.in("-size", `${width}x${height}`);
	im.out("-liquid-rescale", 100 - power + "%");
	im.resize(width, height, "!");

	return new Promise((resolve, reject) => {
		im.toBuffer((err, buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(buffer);
			}
		});
	});
};

new UserCommand({
	regexp: /(?:^!жмых)(?:\s(.*))?$/i,
	process: async function (message, vk) {
		await message.loadMessagePayload();

		if (message.state.args[1] && !Number(message.state.args[1])) {
			return await message.editMessage({
				message: `${message.state.args[1]} не является числом`,
			});
		}

		const seamCarvingPower = Number(message.state.args[1]) || 50;

		if (message.replyMessage?.hasAttachments("sticker")) {
			const source = utils.array.last(
				message.replyMessage.getAttachments("sticker")[0].images,
			);
			const graffiti = await VK.slave.getVK().upload.documentGraffiti({
				group_id: DB.config.VK.group.id,
				source: {
					value: await seamCarving(source.url, seamCarvingPower),
					filename: "sticker.png",
				},
			});

			return await message.reply({
				message: `Жмых стикера:`,
				attachment: graffiti.toString(),
			});
		}

		if (message.replyMessage?.hasAttachments("photo")) {
			const source =
				message.replyMessage.getAttachments("photo")[0].largeSizeUrl;

			const photo = await vk.upload.messagePhoto({
				peer_id: DB.config.VK.group.conversations.includes(
					message.chatId as number,
				)
					? undefined
					: message.peerId,
				source: {
					value: await seamCarving(source as string, seamCarvingPower),
					filename: "sticker.png",
				},
			});

			return await message.reply({
				message: `Жмых фото:`,
				attachment: photo.toString(),
			});
		}

		if (message.hasAttachments("photo")) {
			const source = message.getAttachments("photo")[0].largeSizeUrl;

			const photo = await vk.upload.messagePhoto({
				peer_id: DB.config.VK.group.conversations.includes(
					message.chatId as number,
				)
					? undefined
					: message.peerId,
				source: {
					value: await seamCarving(source as string, seamCarvingPower),
					filename: "sticker.png",
				},
			});

			return await message.reply({
				message: `Жмых фото:`,
				attachment: photo.toString(),
			});
		}

		return await message.editMessage({
			message: `Не найдено изображение или стикер`,
		});
	},
});

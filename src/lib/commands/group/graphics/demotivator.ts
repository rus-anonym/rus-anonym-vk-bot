import path from "path";
import utils from "rus-anonym-utils";
import JIMP from "jimp";

import { GroupCommand } from "../../../utils/lib/commands/core";

import DB from "../../../DB/core";

const demotivate = async (source: string, text: string): Promise<Buffer> => {
	const image = await JIMP.read(source);
	const demotivator = await JIMP.read(
		path.resolve(__dirname + "../../../../../../assets/demotivator.jpg"),
	);
	const font = await JIMP.loadFont(
		path.resolve(__dirname + "../../../../../../assets/demotivator.fnt"),
	);
	image.resize(560, 410);
	demotivator.blit(image, 700 / 2 - 600 / 2 + 20, 560 / 2 - 410 / 2 - 29);
	demotivator.print(
		font,
		0,
		600 / 2 + 200,
		{
			text,
			alignmentX: JIMP.HORIZONTAL_ALIGN_CENTER,
		},
		700,
		600,
	);
	return await demotivator.getBufferAsync(JIMP.MIME_PNG);
};

new GroupCommand({
	regexp: /(?:^\/demotivator)(?:\s(.*))$/i,
	process: async function (message, vk) {
		if (message.replyMessage?.hasAttachments("sticker")) {
			const source = utils.array.last(
				message.replyMessage.getAttachments("sticker")[0].images,
			);

			const photo = await vk.upload.messagePhoto({
				peer_id: DB.config.VK.group.conversations.includes(
					message.chatId as number,
				)
					? undefined
					: message.peerId,
				source: {
					value: await demotivate(source.url, message.state.args[1]),
					filename: "demotivator.png",
				},
			});

			return await message.state.sendMessage({
				message: `Демотиватор:`,
				attachment: photo.toString(),
				content_source: JSON.stringify({
					type: "message",
					owner_id: message.senderId,
					peer_id: message.peerId,
					conversation_message_id: message.conversationMessageId,
				}),
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
					value: await demotivate(source as string, message.state.args[1]),
					filename: "demotivator.png",
				},
			});

			return await message.state.sendMessage({
				message: `Демотиватор:`,
				attachment: photo.toString(),
				content_source: JSON.stringify({
					type: "message",
					owner_id: message.senderId,
					peer_id: message.peerId,
					conversation_message_id: message.conversationMessageId,
				}),
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
					value: await demotivate(source as string, message.state.args[1]),
					filename: "demotivator.png",
				},
			});

			return await message.state.sendMessage({
				message: `Демотиватор:`,
				attachment: photo.toString(),
				content_source: JSON.stringify({
					type: "message",
					owner_id: message.senderId,
					peer_id: message.peerId,
					conversation_message_id: message.conversationMessageId,
				}),
			});
		}

		return await message.state.sendMessage({
			message: `Не найдено изображение или стикер`,
		});
	},
});

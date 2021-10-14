import DB from "../../../../DB/core";

import { UserCommand } from "../../../../utils/lib/commands/core";

new UserCommand({
	regexp: /^(?:!message)$/i,
	process: async function (context, vk) {
		if (!context.replyMessage) {
			return context.editMessage({ message: `Нет отвеченного сообщения` });
		}
		await context.loadMessagePayload();

		const infoInDb = await DB.user.models.message.findOne({
			id: context.replyMessage.id,
		});

		if (!infoInDb) {
			return context.editMessage({ message: `О сообщении нет данных в БД` });
		}

		return await context.editMessage({
			message: "Данные:",
			attachment: (
				await vk.upload.messageDocument({
					source: {
						value: Buffer.from(
							JSON.stringify(infoInDb.toJSON(), null, "\t"),
							"utf-8",
						),
						filename: "info.txt",
					},
					peer_id: context.peerId,
				})
			).toString(),
		});
	},
});

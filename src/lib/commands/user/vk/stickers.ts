import utils from "rus-anonym-utils";

import DB from "../../../DB/core";
import { Command } from "../../../utils/lib/command";

new Command(/(?:!stickers)$/i, async function (message) {
	await message.loadMessagePayload();
	let userID;
	if (message.forwards[0]) {
		userID = message.forwards[0].senderId;
	} else if (message.replyMessage) {
		userID = message.replyMessage.senderId;
	} else {
		userID = message.senderId;
	}

	const userStickers = await utils.vk.user.getUserStickerPacks(
		DB.config.vk.user.vkme,
		userID,
	);

	const stickersText = userStickers.items
		.map((stickerPack) => stickerPack.name)
		.join(", ");

	return message.reply(
		`У @id${userID} найдено ${userStickers.items.length} стикеров на сумму ${
			userStickers.total_price * 7
		}₽\n${stickersText.length < 4000 ? stickersText : ""}`,
		{
			disable_mentions: true,
		},
	);
});

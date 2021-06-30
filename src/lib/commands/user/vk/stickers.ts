import utils from "rus-anonym-utils";
import { resolveResource } from "vk-io";

import DB from "../../../DB/core";
import { UserCommand } from "../../../utils/lib/commands";

new UserCommand(/^(?:!стикеры|!stickers)(?:\s(.*))?$/i, async function (
	message,
	vk,
) {
	await message.loadMessagePayload();
	let userID;
	if (message.forwards[0]) {
		userID = message.forwards[0].senderId;
	} else if (message.replyMessage) {
		userID = message.replyMessage.senderId;
	} else if (message.args[1]) {
		try {
			const linkData = await resolveResource({
				resource: message.args[1],
				api: vk.api,
			});
			userID = linkData.id;
		} catch (error) {
			return await message.editMessage({
				message: "Не смог распознать ссылку",
			});
		}
	} else if (!message.isChat) {
		userID = message.peerId;
	} else {
		return await message.editMessage({
			message: "Не смог распознать ссылку",
		});
	}

	const userStickers = await utils.vk.user.getUserStickerPacks(
		DB.config.vk.user.vkme,
		userID,
	);

	const stickersText = userStickers.items
		.map((stickerPack) => stickerPack.name)
		.join(", ");

	return message.editMessage({
		message: `У @id${userID} ${utils.string.declOfNum(
			userStickers.items.length,
			["найден", "найдено", "найдено"],
		)} ${utils.number.separator(
			userStickers.items.length,
			".",
		)} ${utils.string.declOfNum(userStickers.items.length, [
			"стикерпак",
			"стикерпака",
			"стикерпаков",
		])} на сумму ${utils.number.separator(userStickers.total_price * 7, ".")}₽
Платных: ${userStickers.paid}
Бесплатных: ${userStickers.free}
\n\n${stickersText.length < 3900 ? stickersText : ""}`,
		disable_mentions: true,
	});
});

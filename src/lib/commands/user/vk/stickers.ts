import utils from "rus-anonym-utils";

import VK from "../../../VK/core";
import { UserCommand } from "../../../utils/lib/commands";
import InternalUtils from "../../../utils/core";

new UserCommand(/^(?:!стикеры|!stickers)(?:\s(.*))?$/i, async function (
	message,
) {
	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.sendMessage({
			message: error.message,
		});
	}

	const userStickers = await utils.vk.user.getUserStickerPacks(
		VK.fakes.getUserFakeAPI().options.token,
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

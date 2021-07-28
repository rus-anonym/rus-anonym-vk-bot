import utils from "rus-anonym-utils";

import VK from "../../../VK/core";
import InternalUtils from "../../../utils/core";
import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand(/^(?:\/стикеры)(?:\s(.*))?$/i, async function (message) {
	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.groupCommands.getUserId(message);
	} catch (error) {
		return await message.state.sendMessage({
			message: error.message,
		});
	}

	const userStickers = await utils.vk.user.getUserStickerPacks(
		VK.fakes.getUserFakeAPI().options.token,
		userID,
		true,
	);

	return message.state.sendMessage({
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
		])} на сумму ${utils.number.separator(userStickers.totalPrice * 7, ".")}₽
Платных: ${userStickers.stats.paid}
Бесплатных: ${userStickers.stats.free}

Паков: ${userStickers.stats.packs.count}
⠀Обычных: ${userStickers.stats.packs.simple}
⠀Анимированных: ${userStickers.stats.packs.animated}

⠀Бесплатных обычных: ${userStickers.stats.packs.freeSimple}
⠀Бесплатных анимированных: ${userStickers.stats.packs.freeAnimated}
⠀Всего бесплатных: ${userStickers.stats.packs.free}

⠀Платных обычных: ${userStickers.stats.packs.paidSimple}
⠀Платных анимированных: ${userStickers.stats.packs.paidAnimated}
⠀Всего платных: ${userStickers.stats.packs.paid}

Стилей: ${userStickers.stats.styles.count}
⠀Обычных: ${userStickers.stats.styles.simple}
⠀Анимированных: ${userStickers.stats.styles.animated}

⠀Бесплатных обычных: ${userStickers.stats.styles.freeSimple}
⠀Бесплатных анимированных: ${userStickers.stats.styles.freeAnimated}
⠀Всего бесплатных: ${userStickers.stats.styles.free}

⠀Платных обычных: ${userStickers.stats.styles.paidSimple}
⠀Платных анимированных: ${userStickers.stats.styles.paidAnimated}
⠀Всего платных: ${userStickers.stats.styles.paid}`,
		disable_mentions: true,
	});
});

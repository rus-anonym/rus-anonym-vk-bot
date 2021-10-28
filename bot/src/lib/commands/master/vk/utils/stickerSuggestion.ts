import utils from "rus-anonym-utils";

import VK from "../../../../VK/core";
import { UserCommand } from "../../../../utils/lib/commands/core";

new UserCommand({
	regexp: /^(?:стикер)(?:\s(.*))$/i,
	process: async function (message) {
		await message.loadMessagePayload();

		const { dictionary } = await VK.master.getAPI().store.getStickersKeywords({
			all_products: true,
			need_stickers: true,
		});

		for (const suggestion of dictionary) {
			if (suggestion.words.includes(message.state.args[1].toLowerCase())) {
				const randomPack = utils.array.random(suggestion.user_stickers) as {
					sticker_id: number;
				};

				return await message.send({
					sticker_id: randomPack.sticker_id,
				});
			}
		}

		return await message.editMessage({
			message: "Стикеров с такой подсказкой не найден",
		});
	},
});

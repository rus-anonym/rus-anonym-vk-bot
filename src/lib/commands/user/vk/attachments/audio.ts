import utils from "rus-anonym-utils";

import { UserCommand } from "../../../../utils/lib/commands";
import VK from "../../../../VK/core";

new UserCommand(/(?:^!audio)(?:\s(.*))?$/i, async function (message) {
	if (!message.args[1]) {
		return await message.editMessage({
			message: "Отсутствует запрос",
		});
	}

	const audio = await VK.user.getVK().api.call("audio.search", {
		q: message.args[1],
		count: 10,
	});

	return await message.editMessage({
		message: `Нашёл ${audio.items.length} ${utils.string.declOfNum(
			audio.items.length,
			["аудиозапись", "аудизаписи", "аудиозаписей"],
		)}:`,
		attachment: audio.items.map(
			(x: { owner_id: string; id: string; access_key: string }) =>
				`audio${x.owner_id}_${x.id}_${x.access_key}`,
		),
	});
});

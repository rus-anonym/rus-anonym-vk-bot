import axios from "axios";

import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtils from "../../../../utils/core";

new UserCommand(/^(?:!tester)$/i, async function (message) {
	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.editMessage({
			message: error.message,
		});
	}

	try {
		const userData = (
			await axios.get(
				"https://ssapi.ru/vk-bugs-api/?method=getReporter&reporter_id=" +
					userID,
			)
		).data;

		return message.editMessage({
			message: `Пользователь @id${userData.response.reporter.id}
Статус: ${userData.response.reporter.status_text}

Позиция в топе: ${userData.response.reporter.top_position}
Количество отчётов: ${userData.response.reporter.reports_count}

https://vk.com/bugs?act=reporter&id=${userData.response.reporter.id}`,
			disable_mentions: true,
		});
	} catch (error) {
		return message.reply("апи здохло");
	}
});

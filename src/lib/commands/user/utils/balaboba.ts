import axios from "axios";

import { UserCommand } from "../../../utils/lib/commands";

import VK from "../../../VK/core";
import InternalUtils from "../../../utils/core";

new UserCommand(/(?:^!ии)(\s(.*))?$/i, async function (message) {
	if (!message.args[1]) {
		await message.loadMessagePayload();
		let userID;
		try {
			userID = await InternalUtils.userCommands.getUserId(message);
		} catch (error) {
			return await message.editMessage({
				message: error.message,
			});
		}
		const [user] = await VK.group.getVK().api.users.get({
			user_ids: userID.toString(),
		});
		message.args[1] = `${user.first_name} ${user.last_name} это`;
	}
	try {
		const response = await axios({
			url: "https://yandex.ru/lab/api/yalm/text3",
			method: "POST",
			data: {
				query: message.args[1],
				intro: 0,
				filter: 1,
			},
		});
		return await message.editMessage({
			message: response.data.query + response.data.text,
			disable_mentions: true,
			dont_parse_links: true,
		});
	} catch (err) {
		return await message.editMessage({
			message: `Balaboba API Error`,
		});
	}
});

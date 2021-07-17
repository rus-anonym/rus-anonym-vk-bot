import utils from "rus-anonym-utils";

import { GroupCommand } from "../../../utils/lib/commands";

import VK from "../../../VK/core";
import InternalUtils from "../../../utils/core";

new GroupCommand(/(?:^\/ии)(\s(.*))?$/i, async function (message) {
	if (!message.args[1]) {
		let userID;
		try {
			userID = await InternalUtils.groupCommands.getUserId(message);
		} catch (error) {
			return await message.sendMessage({
				message: error.message,
			});
		}
		const [user] = await VK.group.getVK().api.users.get({
			user_ids: userID.toString(),
		});
		message.args[1] = `${user.first_name} ${user.last_name} это`;
	}
	try {
		const response = await utils.yandex.balaboba.generate(message.args[1]);
		return await message.sendMessage({
			message: response.text + `\n\nMS: ${response.ms}`,
			disable_mentions: true,
			dont_parse_links: true,
		});
	} catch (err) {
		return await message.sendMessage({
			message: `Balaboba API Error (${err.message})`,
		});
	}
});
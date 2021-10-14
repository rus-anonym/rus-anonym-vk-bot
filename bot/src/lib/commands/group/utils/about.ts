import { GroupCommand } from "../../../utils/lib/commands/core";
import DB from "../../../DB/core";

new GroupCommand({
	regexp: /(?:^!бот)$/i,
	process: async function (message) {
		return message.state.sendMessage({
			message: `Group DB Stats:
Users: ${await DB.group.models.user.countDocuments()}

Author: @rus_anonym
Source Code: https://github.com/RusAnonym/rus-anonym-vk-bot`,
		});
	},
});

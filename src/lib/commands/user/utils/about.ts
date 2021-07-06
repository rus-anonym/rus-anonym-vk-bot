import { UserCommand } from "../../../utils/lib/commands";
import DB from "../../../DB/core";

new UserCommand(/(?:^!about)$/i, async function (message) {
	return message.editMessage({
		message: `User DB Stats:
Messages: ${await DB.user.models.message.countDocuments()}
Users: ${await DB.user.models.user.countDocuments()}
Chats: ${await DB.user.models.chat.countDocuments()}

Group DB Stats:
Users: ${await DB.group.models.user.countDocuments()}

Author: @rus_anonym
Source Code: https://github.com/RusAnonym/rus-anonym-vk-bot`,
	});
});

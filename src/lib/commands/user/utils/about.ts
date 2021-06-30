import { UserCommand } from "../../../utils/lib/commands";
import DB from "../../../DB/core";

new UserCommand(/(?:^!about|!статус)$/i, async function (message) {
	return message.editMessage({
		message: `DB Stats:
Messages: ${await DB.user.models.message.countDocuments()}
Users: ${await DB.user.models.user.countDocuments()}
Chats: ${await DB.user.models.chat.countDocuments()}`,
	});
});

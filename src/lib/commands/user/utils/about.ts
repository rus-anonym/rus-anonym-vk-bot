import { Command } from "../../../utils/lib/command";
import DB from "../../../DB/core";

new Command(/(?:^!about|!статус)$/i, async function (message) {
	return message.editMessage({
		message: `DB Stats:
Messages: ${await DB.user.models.message.countDocuments()}
Users: ${await DB.user.models.user.countDocuments()}
Chats: ${await DB.user.models.chat.countDocuments()}`,
	});
});

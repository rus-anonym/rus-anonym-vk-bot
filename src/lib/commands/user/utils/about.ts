import { Command } from "../../../utils/lib/command";
import DB from "../../../DB/core";

new Command(/(?:^!about)$/i, async function (message) {
	return message.editMessage({
		message: `DB Stats:
Messages: ${await DB.models.message.countDocuments()}
Users: ${await DB.models.user.countDocuments()}
Chats: ${await DB.models.chat.countDocuments()}`,
	});
});

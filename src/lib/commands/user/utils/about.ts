import { UserCommand } from "../../../utils/lib/commands/core";
import DB from "../../../DB/core";
import InternalUtils from "../../../utils/core";

new UserCommand(/(?:^!about|!stats)$/i, async function (message) {
	const memoryData = process.memoryUsage();
	return message.editMessage({
		message: `User DB Stats:
Messages: ${await DB.user.models.message.countDocuments()}
Users: ${await DB.user.models.user.countDocuments()}
Chats: ${await DB.user.models.chat.countDocuments()}

Group DB Stats:
Users: ${await DB.group.models.user.countDocuments()}

Free groups for reserve: ${await DB.main.models.reserveGroup
			.find({
				isReserve: false,
			})
			.countDocuments()}

Process:
RSS: ${InternalUtils.commands.bytesToSize(memoryData.rss)}
Heap Total: ${InternalUtils.commands.bytesToSize(memoryData.heapTotal)}
Heap Used: ${InternalUtils.commands.bytesToSize(memoryData.heapUsed)}
V8 External Memory: ${InternalUtils.commands.bytesToSize(memoryData.external)}

Author: https://vk.com/rus_anonym
${
	message.text === "!about"
		? "Source Code: https://github.com/RusAnonym/rus-anonym-vk-bot"
		: ""
}`,
	});
});

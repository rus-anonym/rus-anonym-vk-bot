import { GroupCommand } from "../../../../utils/lib/commands/core";
import DB from "../../../../DB/core";
import InternalUtils from "../../../../utils/core";

new GroupCommand({
	regexp: /(?:^!беседы участник)(?:\s(.*))?$/i,
	isPrivate: true,
	process: async function (message) {
		let userID;
		try {
			userID = await InternalUtils.groupCommands.getUserId(
				message,
				message.state.args[1],
			);
		} catch (error) {
			return await message.state.sendMessage({
				message: error.message,
			});
		}

		const userConversations = await DB.main.models.vkConversation.find({
			members: {
				$in: [userID],
			},
		});

		return await message.state.sendMessage({
			message: `Пользователь @${userID > 0 ? "id" : "club"}${userID} найден в ${
				userConversations.length
			} беседах
${userConversations
	.map((conversation, index) => `${index + 1}. ${conversation.link}`)
	.join("\n")}`,
		});
	},
});

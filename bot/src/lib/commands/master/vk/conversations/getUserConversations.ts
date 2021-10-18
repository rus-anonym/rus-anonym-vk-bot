import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtils from "../../../../utils/core";
import DB from "../../../../DB/core";

new UserCommand({
	regexp: /(?:^!беседы пользователя)(?:\s(.*))?$/i,
	process: async function (message) {
		await message.loadMessagePayload();
		let userID;
		try {
			userID = await InternalUtils.userCommands.getUserId(
				message,
				message.state.args[1],
			);
		} catch (error) {
			return await message.editMessage({
				message: error.message,
			});
		}

		const userConversations = await DB.main.models.vkConversation.find({
			members: {
				$in: [userID],
			},
		});

		return await message.reply({
			message: `Пользователь @${userID > 0 ? "id" : "club"}${userID} найден в ${
				userConversations.length
			} беседах
${userConversations
	.map((conversation, index) => `${index + 1}. ${conversation.link}`)
	.join("\n")}`,
		});
	},
});

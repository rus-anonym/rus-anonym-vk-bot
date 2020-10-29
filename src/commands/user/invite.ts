import { groupLogger } from "./../../plugins/logger";
import { userVK } from "../../plugins/userVK";
import { resolveResource } from "vk-io";
import { ModernUserMessageContext } from "./../../plugins/types";
export = {
	regexp: /^(?:inv|invite)\s?([^]+)?/i,
	process: async function (message: ModernUserMessageContext) {
		if (!message.isChat || !message.chatId) {
			return message.sendMessage(`это не чат.`);
		}

		if (
			!message.args[1] &&
			!message.replyMessage &&
			message.forwards.length !== 1
		) {
			return message.sendMessage(
				`отправьте ссылку на человека или перешлите сообщение`,
			);
		}

		let user: any;

		if (!message.args[1] && (message.replyMessage || message.forwards[0])) {
			user = message.replyMessage?.senderId || message.forwards[0].senderId;
		} else {
			try {
				let data = await resolveResource({
					resource: message.args[1],
					api: userVK.api,
				});
				user = data.id;
			} catch (error) {
				return message.sendMessage(`отправьте валидную ссылку на человека.`);
			}
		}

		if (user < 0) {
			return message.sendMessage(`отправьте валидную ссылку на человека.`);
		}

		try {
			await userVK.api.messages.addChatUser({
				chat_id: message.chatId,
				user_id: user,
			});
		} catch (error) {
			return await groupLogger.logInRestLogs(
				`Fail invite user @id${user} to chat #${
					message.chatId
				}\nError: ${error.toString()}`,
			);
		}
		return await groupLogger.logInRestLogs(
			`Succesfully invite user @id${user} to chat #${message.chatId}`,
		);
	},
};

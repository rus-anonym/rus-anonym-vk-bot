import {
	ChatDocument,
	UserDocument,
	MessageDocument,
} from "./../../../lib/DB/types";
import ICommand from "../../../types/interfaces/commands";
import DataBase from "../../../lib/DB/core";
import * as utils from "rus-anonym-utils";

const command: ICommand = {
	regexp: [/(?:^.ой)(?:\s([0-9]+))?$/i],
	process: async function (message, vk) {
		if (!message.args[1]) {
			message.args[1] = 5;
		}
		let chatMessages = [];
		if (message.isChat) {
			const chatData: ChatDocument = await DataBase.models.chat.findOne({
				id: message.chatId,
			});
			chatMessages = chatData.messages;
		} else {
			const userData: UserDocument = await DataBase.models.user.findOne({
				id: message.peerId,
			});
			chatMessages = userData.personalMessages;
		}
		const selectedMessages: MessageDocument[] = await DataBase.models.message.find(
			{
				senderId: DataBase.config.vk.user.id,
				id: {
					$in: chatMessages,
				},
				created: {
					$gt: new Date(Number(new Date()) - 24 * 60 * 60 * 1000),
				},
			},
		);
		const messagesForDelete = [];
		for (let i = selectedMessages.length - 1; i > 0; i--) {
			if (messagesForDelete.length === Number(message.args[1]) + 1) {
				break;
			} else {
				messagesForDelete.push(selectedMessages[i].id);
			}
		}
		const parsedMessagesForDelete = utils.array.splitTo(messagesForDelete, 200);
		for (const chunk of parsedMessagesForDelete) {
			await vk.api.messages.delete({
				message_ids: chunk,
				delete_for_all: 1,
			});
		}
		return;
	},
};

export default command;

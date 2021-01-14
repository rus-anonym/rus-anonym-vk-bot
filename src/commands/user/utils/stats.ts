import { UserDocument, ChatDocument } from "./../../../lib/DB/types";
import ICommand from "../../../types/interfaces/commands";
import DataBase from "../../../lib/DB/core";

const command: ICommand = {
	regexp: [/(?:^\.stats)$/i],
	process: async function (message) {
		let fromThisChatMessages: number;
		if (message.isChat) {
			const chatData: ChatDocument = await DataBase.models.chat.findOne({
				id: message.chatId,
			});
			fromThisChatMessages = chatData.messages.length;
		} else {
			const userData: UserDocument = await DataBase.models.user.find({
				id: message.peerId,
			});
			fromThisChatMessages = userData.personalMessages.length;
		}
		return await message.send(
			`Messages in DB: ${await DataBase.models.message.countDocuments()}
Users in DB: ${await DataBase.models.user.countDocuments()}
Chats in DB: ${await DataBase.models.chat.countDocuments()}
From this chat: ${fromThisChatMessages}`,
		);
	},
};

export default command;

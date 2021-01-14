import { ChatDocument } from "./../../../lib/DB/types";
import ICommand from "../../../types/interfaces/commands";
import DataBase from "../../../lib/DB/core";

const command: ICommand = {
	regexp: [/(?:^\.stats)$/i],
	process: async function (message) {
		const chatData: ChatDocument = await DataBase.models.chat.findOne({
			id: message.chatId,
		});
		return await message.send(
			`Messages in DB: ${await DataBase.models.message.countDocuments()}
Users in DB: ${await DataBase.models.user.countDocuments()}
Chats in DB: ${await DataBase.models.chat.countDocuments()}
From this chat: ${chatData.messages.length}`,
		);
	},
};

export default command;

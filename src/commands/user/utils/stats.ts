import ICommand from "../../../types/interfaces/commands";
import DataBase from "../../../lib/DB/core";

const command: ICommand = {
	regexp: [/(?:^\.stats)$/i],
	process: async function (message) {
		return await message.send(
			`Messages in DB: ${await DataBase.models.message.countDocuments()}\nFrom this chat: ${
				(await DataBase.models.message.find({ peerId: message.peerId })).length
			}`,
		);
	},
};

export default command;

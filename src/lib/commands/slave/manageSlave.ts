import { SlaveCommand } from "../../utils/lib/commands/core";
import DB from "../../DB/core";

new SlaveCommand({
	regexp: /(?:^раб оффнись|раб отключись)$/i,
	process: async function (message) {
		if (message.senderId !== DB.config.VK.user.master.id) {
			return;
		}

		DB.main.config.data.slaveStatus = false;
		await DB.main.config.data.save();

		return message.reply(`Раб отправлен отдыхать`);
	},
});

new SlaveCommand({
	regexp: /(?:^раб работать|раб на работу)$/i,
	process: async function (message) {
		if (message.senderId !== DB.config.VK.user.master.id) {
			return;
		}

		DB.main.config.data.slaveStatus = true;
		await DB.main.config.data.save();

		return message.reply(`Раб отправлен работать`);
	},
});

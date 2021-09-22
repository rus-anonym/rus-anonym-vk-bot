import { SlaveCommand } from "../../utils/lib/commands/core";

new SlaveCommand({
		regexp: /(?:^slave)$/i, process: async function (message) {
			return message.reply(`Yes, my white master`);
		}
	});

new SlaveCommand({
		regexp: /(?:^раб)$/i, process: async function (message) {
			return message.reply(`Да, мой белый господин`);
		}
	});

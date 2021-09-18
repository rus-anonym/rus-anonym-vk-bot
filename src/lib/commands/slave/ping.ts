import { SlaveCommand } from "../../utils/lib/commands/core";

new SlaveCommand(/(?:^slave)$/i, async function (message) {
	return message.reply(`Yes, my white master`);
});

new SlaveCommand(/(?:^раб)$/i, async function (message) {
	return message.reply(`Да, мой белый господин`);
});

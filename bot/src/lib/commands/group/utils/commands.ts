import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand({
	regexp: /(?:^!команды|\/help|!help|помощь|начать)$/i,
	process: async function (message) {
		return message.state.sendMessage({
			message: `Команды:`,
			attachment: "article-194686664_60597_e899de91872d46979d",
		});
	},
});

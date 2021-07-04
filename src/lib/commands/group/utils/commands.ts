import { GroupCommand } from "../../../utils/lib/commands";

new GroupCommand(/(?:^!команды|\/help|!help|помощь)$/i, async function (
	message,
) {
	return message.sendMessage({
		message: `Команды:`,
		attachment: "article-194686664_60597_e899de91872d46979d",
	});
});

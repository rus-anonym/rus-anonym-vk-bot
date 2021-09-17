import { UserCommand } from "../../../utils/lib/commands/core";
import DB from "../../../DB/core";
import InternalUtils from "../../../utils/core";

new UserCommand(/(?:^!disable improve)$/i, async function (message) {
	await InternalUtils.logger.send({
		message: `Автоматическое улучшение текста отключено для чата #${message.peerId}`,
	});
	DB.main.config.data.exceptions.dontImproveText.push(message.peerId);
	await DB.main.config.data.save();
	await message.deleteMessage({ delete_for_all: true });
});

new UserCommand(/(?:^!enable improve)$/i, async function (message) {
	await InternalUtils.logger.send({
		message: `Автоматическое улучшение текста включено для чата #${message.peerId}`,
	});
	const index = DB.main.config.data.exceptions.dontImproveText.indexOf(
		message.peerId,
	);
	if (index > -1) {
		DB.main.config.data.exceptions.dontImproveText.splice(index, 1);
		await DB.main.config.data.save();
	}
	await message.deleteMessage({ delete_for_all: true });
});

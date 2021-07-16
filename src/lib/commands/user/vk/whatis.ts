import { UserCommand } from "../../../utils/lib/commands";
import InternalUtls from "../../../utils/core";

new UserCommand(/(?:^!whatis)$/i, async function (message) {
	await message.loadMessagePayload();

	if (message.forwards[0] && message.forwards[0].hasAttachments()) {
		return message.reply({
			disable_mentions: true,
			message: `
Прикрепления:
${await InternalUtls.commands.attachmentsToString(message.forwards[0])}`,
		});
	}

	if (message.replyMessage?.hasAttachments()) {
		return message.reply({
			disable_mentions: true,
			message: `
Прикрепления:
${await InternalUtls.commands.attachmentsToString(message.replyMessage)}`,
		});
	}

	if (message.hasAttachments()) {
		return message.reply({
			disable_mentions: true,
			message: `
Прикрепления:
${await InternalUtls.commands.attachmentsToString(message)}`,
		});
	}

	return message.editMessage({
		disable_mentions: true,
		message: `Не нашёл прикреплений`,
		dont_parse_links: true,
	});
});

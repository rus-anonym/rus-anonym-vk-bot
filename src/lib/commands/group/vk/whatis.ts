import { GroupCommand } from "../../../utils/lib/commands/core";
import InternalUtls from "../../../utils/core";

new GroupCommand({
		regexp: /(?:^\/whatis)$/i, process: async function (message) {
			if (message.forwards[0] && message.forwards[0].hasAttachments()) {
				return await message.state.sendMessage({
					disable_mentions: true,
					message: `Прикрепления:
${await InternalUtls.groupCommands.attachmentsToString(message.forwards[0])}`,
				});
			}

			if (message.replyMessage?.hasAttachments()) {
				return await message.state.sendMessage({
					disable_mentions: true,
					message: `Прикрепления:
${await InternalUtls.groupCommands.attachmentsToString(message.replyMessage)}`,
				});
			}

			if (message.hasAttachments()) {
				return await message.reply({
					disable_mentions: true,
					message: `Прикрепления:
${await InternalUtls.groupCommands.attachmentsToString(message)}`,
				});
			}

			return await message.state.sendMessage({
				disable_mentions: true,
				message: `Не нашёл прикреплений`,
				dont_parse_links: true,
			});
		}
	});

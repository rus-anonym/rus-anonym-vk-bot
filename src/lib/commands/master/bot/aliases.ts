import { UserCommand } from "../../../utils/lib/commands/core";
import DB from "../../../DB/core";

new UserCommand({
	regexp: /(?:^add alias)(?:\s(.*))$/i,
	process: async function (message) {
		if (!message.replyMessage) {
			return message.editMessage({
				message: `Не указаны данные`,
			});
		}

		await message.loadMessagePayload();

		if (
			message.replyMessage.attachments.length === 0 &&
			!message.replyMessage.text
		) {
			return message.editMessage({
				message: `Не указаны данные`,
			});
		}

		const isAliasExist = DB.main.config.data.textAliases.find(
			(x) => x.trigger === message.state.args[1].toLowerCase(),
		);

		if (isAliasExist) {
			return message.editMessage({
				message: `alias уже создан`,
			});
		}

		DB.main.config.data.textAliases.push({
			trigger: message.state.args[1].toLowerCase(),
			text: message.replyMessage.text,
			attachments: message.replyMessage.attachments.map((x) => x.toString()),
			sendNewMessage: message.replyMessage.hasAttachments("audio_message"),
		});

		DB.main.config.data.markModified("textAliases");
		await DB.main.config.data.save();

		return message.editMessage({
			message: `Создал alias "${message.state.args[1]}"`,
		});
	},
});

new UserCommand({
	regexp: /(?:^remove alias)(?:\s(.*))$/i,
	process: async function (message) {
		const aliasIndex = DB.main.config.data.textAliases.findIndex(
			(x) => x.trigger === message.state.args[1].toLowerCase(),
		);

		if (aliasIndex === -1) {
			return message.editMessage({
				message: `alias does not exist`,
			});
		} else {
			DB.main.config.data.textAliases.splice(aliasIndex, 1);

			DB.main.config.data.markModified("textAliases");
			await DB.main.config.data.save();

			return message.editMessage({
				message: `alias "${message.state.args[1]}" удалён`,
			});
		}
	},
});

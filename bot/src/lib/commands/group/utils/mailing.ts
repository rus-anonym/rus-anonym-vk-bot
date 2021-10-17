import { Keyboard } from "vk-io";

import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand({
	regexp: /(?:^рассылка)(?:\s(включить|отключить))$/i,
	process: async function (message) {
		if (message.state.args[1].toLowerCase() === "отключить") {
			message.state.user.isMailingAllowed = false;
		} else {
			message.state.user.isMailingAllowed = true;
		}
		await message.state.user.save();
		return await message.state.sendMessage({
			message: `Вы ${
				message.state.user.isMailingAllowed ? `включили` : "отключили"
			} рассылку`,
			keyboard: Keyboard.builder()
				.textButton({
					label:
						(message.state.user.isMailingAllowed ? "Отключить" : "Включить") +
						" рассылку",
					payload: {
						cmd:
							"Рассылка " +
							(message.state.user.isMailingAllowed ? "отключить" : "включить"),
					},
					color: message.state.user.isMailingAllowed
						? Keyboard.NEGATIVE_COLOR
						: Keyboard.POSITIVE_COLOR,
				})
				.inline(),
		});
	},
});

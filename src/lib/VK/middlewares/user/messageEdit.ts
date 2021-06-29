import { UserModernMessageContext } from "../../../utils/lib/commands";
import { MessageContext } from "vk-io";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

function userMessageEdit(message: MessageContext): void {
	InternalUtils.user.saveMessage(message).catch((err) => {
		InternalUtils.logger.send(
			`Error on save message #${message.id}\n
https://vk.com/im?sel=${
				message.isChat ? `c${message.chatId}` : message.peerId
			}&msgid=${message.id}\n\n${err.toString()}`,
			"error",
		);
	});

	if (message.isOutbox && message.text) {
		const selectedCommand = InternalUtils.userCommands.find((command) =>
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			command.check(message.text!),
		);

		if (selectedCommand) {
			const TempVK = VK.user.getVK();
			message.args = selectedCommand.regexp.exec(
				message.text,
			) as RegExpExecArray;
			selectedCommand
				.process(message as UserModernMessageContext, TempVK)
				.catch((err) => {
					InternalUtils.logger.send(
						`Error on execute command\nError: ${err.toString()}`,
						"error",
					);
				});
		}
	}
}

export default userMessageEdit;

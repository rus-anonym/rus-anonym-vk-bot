import { UserModernMessageContext } from "../../../utils/lib/commands/core";
import { MessageContext } from "vk-io";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

function userMessageNew(message: MessageContext): void {
	InternalUtils.user.saveMessage(message).catch((err) => {
		InternalUtils.logger.send({
			message: `Error on save message #${message.id}\n
https://vk.com/im?sel=${
				message.isChat ? `c${message.chatId}` : message.peerId
			}&msgid=${message.id}\n\n${err.toString()}`,
			type: "error",
		});
	});

	if (message.isOutbox && message.text) {
		const selectedCommand = InternalUtils.userCommands.findCommand(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			message.text!,
		);

		if (selectedCommand) {
			const TempVK = VK.user.getVK();
			message.args = selectedCommand.regexp.exec(
				message.text,
			) as RegExpExecArray;
			selectedCommand
				.process(message as UserModernMessageContext, TempVK)
				.catch((err) => {
					InternalUtils.logger.send({
						message: `Error on execute command\nError: ${err.toString()}`,
						type: "error",
					});
				});
		}
	}
}

export default userMessageNew;

import { GroupModernMessageContext } from "./../../../utils/lib/commands";
import { MessageContext } from "vk-io";

import InternalUtils from "../../../utils/core";
import VK from "../../../VK/core";

function userMessageHandler(message: MessageContext): void {
	if (message.text && message.isInbox) {
		const selectedCommand = InternalUtils.groupCommands.find((command) =>
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			command.check(message.text!),
		);

		if (selectedCommand) {
			const TempVK = VK.group.getVK();
			message.args = selectedCommand.regexp.exec(
				message.text,
			) as RegExpExecArray;
			selectedCommand
				.process(message as GroupModernMessageContext, TempVK)
				.catch((err) => {
					InternalUtils.logger.send(
						`Error on execute command\nError: ${err.toString()}`,
						"error",
					);
				});
		}
	}
}

export default userMessageHandler;

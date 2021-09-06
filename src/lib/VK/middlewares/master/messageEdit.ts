import { UserModernMessageContextState } from "../../../utils/lib/commands/core";
import { MessageContext } from "vk-io";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

function userMessageEdit(
	message: MessageContext<UserModernMessageContextState>,
): void {
	InternalUtils.user.saveMessage(message).catch(() => null);

	if (
		message.isOutbox &&
		message.text &&
		message.text.charCodeAt(message.text.length - 1) !== 13
	) {
		const selectedCommand = InternalUtils.userCommands.findCommand(
			message.text,
		);

		if (selectedCommand) {
			const TempVK = VK.master.getVK();
			message.state.args = selectedCommand.regexp.exec(
				message.text,
			) as RegExpExecArray;
			InternalUtils.user.improveMessageContext(message);
			selectedCommand.process(message, TempVK).catch((err) => {
				InternalUtils.logger.send({
					message: `Error on execute command\nError: ${err.toString()}`,
					type: "error",
				});
			});
		}
	}
}

export default userMessageEdit;

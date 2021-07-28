import { UserModernMessageContextState } from "../../../utils/lib/commands/core";
import { MessageContext } from "vk-io";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

function userMessageNew(
	message: MessageContext<UserModernMessageContextState>,
): void {
	InternalUtils.user.saveMessage(message).catch(() => null);

	if (message.isOutbox && message.text) {
		const selectedCommand = InternalUtils.userCommands.findCommand(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			message.text!,
		);

		if (selectedCommand) {
			const TempVK = VK.user.getVK();
			message.state.args = selectedCommand.regexp.exec(
				message.text,
			) as RegExpExecArray;
			selectedCommand.process(message, TempVK).catch((err) => {
				InternalUtils.logger.send({
					message: `Error on execute command\nError: ${err.toString()}
JSON Stringify: ${JSON.stringify(err.toJSON(), null, "\t")}`,
					type: "error",
				});
			});
		}
	}
}

export default userMessageNew;

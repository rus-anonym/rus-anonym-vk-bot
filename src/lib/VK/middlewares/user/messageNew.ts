import utils from "rus-anonym-utils";

import { MessageContext } from "vk-io";
import { UserModernMessageContextState } from "../../../utils/lib/commands/core";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

async function userMessageNew(
	message: MessageContext<UserModernMessageContextState>,
): Promise<void> {
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
		} else {
			let newMessageText = message.text;
			if (/[\wа-яё	]/i.test(utils.array.last(message.text.split("")))) {
				newMessageText += ".";
			}
			if (/[\wа-яё]/.test(message.text[0])) {
				newMessageText = newMessageText.substring(1);
				newMessageText = message.text[0].toUpperCase() + newMessageText;
			}
			if (message.text !== newMessageText) {
				await message.editMessage({
					message: newMessageText,
				});
			}
		}
	}
}

export default userMessageNew;

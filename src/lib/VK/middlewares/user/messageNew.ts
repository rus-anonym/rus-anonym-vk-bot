import utils from "rus-anonym-utils";

import { MessageContext } from "vk-io";
import { UserModernMessageContextState } from "../../../utils/lib/commands/core";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

const improveText = (text: string) => {
	if (text.includes("&#13;") || /^(?:\[club\d+\|.*])/.test(text)) {
		return text;
	}
	let newText = text;
	if (/(?=[^\d])[\wа-яё]/i.test(utils.array.last(text.split("")))) {
		newText += ".";
	}
	if (/(?=[^\d])[\wа-яё]/.test(text[0])) {
		newText = newText.substring(1);
		newText = text[0].toUpperCase() + newText;
	}
	return newText;
};

async function userMessageNew(
	message: MessageContext<UserModernMessageContextState>,
): Promise<void> {
	InternalUtils.user.saveMessage(message).catch(() => null);

	if (message.isOutbox && message.text && !message.text.includes("&#13;")) {
		const selectedCommand = InternalUtils.userCommands.findCommand(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			message.text!,
		);

		if (selectedCommand) {
			const TempVK = VK.user.getVK();
			message.state.args = selectedCommand.regexp.exec(
				message.text,
			) as RegExpExecArray;
			const sendMessage = message.send.bind(message);
			message.send = (text, params = {}) => {
				if (typeof text === "string") {
					return sendMessage({
						message: text + "&#13;",
						...params,
					});
				} else {
					text.message ? (text.message += "&#13;") : null;
					return sendMessage(text);
				}
			};
			selectedCommand.process(message, TempVK).catch((err) => {
				InternalUtils.logger.send({
					message: `Error on execute command\nError: ${err.toString()}`,
					type: "error",
				});
			});
		} else {
			const newMessageText = improveText(message.text);
			if (message.text !== newMessageText) {
				await message.editMessage({
					message: newMessageText,
				});
			}
		}
	}
}

export default userMessageNew;

import { MessageContext } from "vk-io";
import { UserModernMessageContextState } from "../../../utils/lib/commands/core";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

const improveText = (text: string) => {
	if (/^(?:\[club\d+\|.*])/.test(text)) {
		return text;
	}
	const isWord = (string: string) => /(?=[^\d])[\wа-яё]/i.test(string);
	const isUpperCase = (string: string) => /[А-ЯЁA-Z]/.test(string);
	const splittedText = text.split("");
	const outArray = [];
	let isNewLine = true;
	for (const stringIndex in splittedText) {
		const index = Number(stringIndex);
		const currentSymbol = splittedText[index];
		if (isNewLine) {
			outArray.push(currentSymbol.toUpperCase());
			isNewLine = false;
			continue;
		}
		splittedText.reverse();
		const prevSymbol = splittedText.find(
			(element, elementIndex) =>
				element !== " " && elementIndex > splittedText.length - (index + 1),
		);
		splittedText.reverse();
		if (currentSymbol === "\n") {
			if (prevSymbol && isWord(prevSymbol)) {
				outArray.push(".");
			}
			outArray.push(currentSymbol);
			isNewLine = true;
			continue;
		}
		outArray.push(currentSymbol);
		const nextSymbol = splittedText.find(
			(element, elementIndex) => element !== " " && elementIndex > index,
		);
		if (nextSymbol && isWord(currentSymbol)) {
			if (isUpperCase(nextSymbol)) {
				outArray.push(".");
			}
		}
		if (index === splittedText.length - 1 && isWord(currentSymbol)) {
			outArray.push(".");
		}
	}
	return outArray.join("");
};

async function userMessageNew(
	message: MessageContext<UserModernMessageContextState>,
): Promise<void> {
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

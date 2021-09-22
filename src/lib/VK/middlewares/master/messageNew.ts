import utils from "rus-anonym-utils";

import { MessageContext } from "vk-io";
import { UserModernMessageContextState } from "../../../utils/lib/commands/core";

import InternalUtils from "../../../utils/core";
import VK from "../../core";
import DB from "../../../DB/core";

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
			await selectedCommand.process(message, TempVK).catch((err) => {
				InternalUtils.logger.send({
					message: `Error on execute command\nError: ${err.toString()}`,
					type: "error",
				});
			});
			return;
		}

		const alias = DB.main.config.data.textAliases.find(
			(x) => x.trigger === message.text?.toLowerCase(),
		);

		if (alias) {
			if (alias.sendNewMessage) {
				await message.deleteMessage({ delete_for_all: true });
				await message.send({
					message: alias.text,
					disable_mentions: true,
					reply_to: message.replyMessage?.id || undefined,
					attachment: alias.attachments,
				});
			} else {
				await message.editMessage({
					message: alias.text,
					disable_mentions: true,
					attachment: alias.attachments,
				});
			}

			return;
		} else if (
			!DB.main.config.data.exceptions.dontImproveText.includes(message.peerId)
		) {
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

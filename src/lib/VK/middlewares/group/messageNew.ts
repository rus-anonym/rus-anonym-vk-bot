import { GroupModernMessageContext } from "../../../utils/lib/commands/core";

import InternalUtils from "../../../utils/core";
import VK from "../../core";

async function groupMessageNew(
	message: GroupModernMessageContext,
): Promise<void> {
	if (message.isFromGroup) {
		return;
	}

	if (message.text && message.isInbox) {
		if (message.text === "бот" && message.chatId === 20) {
			await message.send("понг");
			return;
		}
		const selectedCommand = InternalUtils.groupCommands.findCommand(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			message.text!,
		);

		if (selectedCommand) {
			const TempVK = VK.group.getVK();
			message.args = selectedCommand.regexp.exec(
				message.text,
			) as RegExpExecArray;
			message.user = await InternalUtils.group.getUserData(message.senderId);
			message.sendMessage = async (text, params) => {
				if (typeof text !== "string" && text.message !== undefined) {
					text.message =
						`@id${message.user.id} (${message.user.nickname}):\n` +
						text.message;
				}
				const paramsForSend = Object.assign(
					{
						disable_mentions: true,
						forward: JSON.stringify({
							peer_id: message.peerId,
							conversation_message_ids: message.conversationMessageId,
							is_reply: 1,
						}),
					},
					typeof text === "string" ? params || {} : text,
				);
				if (typeof text === "string") {
					return await message.send(
						`@id${message.user.id} (${message.user.nickname}):\n` + text,
						paramsForSend,
					);
				} else {
					return await message.send(paramsForSend);
				}
			};
			selectedCommand.process(message, TempVK).catch((err) => {
				InternalUtils.logger.send({
					message: `Error on execute command\nError: ${err.toString()}`,
					type: "error",
				});
			});
			return;
		} else {
			if (!message.isChat) {
				await message.send({
					message: `Команды:`,
					attachment: "article-194686664_60597_e899de91872d46979d",
					forward: JSON.stringify({
						peer_id: message.peerId,
						conversation_message_ids: message.conversationMessageId,
						is_reply: 1,
					}),
				});
			}
			return;
		}
	}
}

export default groupMessageNew;

import { GroupModernMessageContext } from "../../../utils/lib/commands/core";

import InternalUtils from "../../../utils/core";
import DB from "../../../DB/core";
import VK from "../../core";

async function groupMessageNew(
	context: GroupModernMessageContext,
): Promise<void> {
	if (context.isFromGroup) {
		return;
	}

	if (context.text && context.isInbox) {
		let selectedCommand = InternalUtils.groupCommands.findCommand(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			context.text!,
			context.senderId === DB.config.VK.user.master.id,
		);

		if (!selectedCommand && context.hasMessagePayload) {
			selectedCommand = InternalUtils.groupCommands.findCommand(
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				context.messagePayload.cmd || "null",
				context.senderId === DB.config.VK.user.master.id,
			);
		}

		if (selectedCommand) {
			const TempVK = VK.group.getVK();
			context.state.args = selectedCommand.regexp.exec(
				context.text,
			) as RegExpExecArray;
			context.state.user = await InternalUtils.group.getUserData(
				context.senderId,
			);
			context.state.sendMessage = async (text, params) => {
				if (typeof text !== "string" && text.message !== undefined) {
					text.message =
						`@id${context.state.user.id} (${context.state.user.nickname}):\n` +
						text.message;
				}
				const paramsForSend = Object.assign(
					{
						disable_mentions: true,
						forward: JSON.stringify({
							peer_id: context.peerId,
							conversation_message_ids: context.conversationMessageId,
							is_reply: 1,
						}),
					},
					typeof text === "string" ? params || {} : text,
				);
				if (typeof text === "string") {
					return await context.send(
						`@id${context.state.user.id} (${context.state.user.nickname}):\n` +
							text,
						paramsForSend,
					);
				} else {
					return await context.send(paramsForSend);
				}
			};
			selectedCommand.process(context, TempVK).catch((err) => {
				InternalUtils.logger.send({
					message: `Error on execute command\nError: ${err.toString()}`,
					type: "error",
				});
			});
			return;
		} else {
			if (!context.isChat) {
				await context.send({
					message: `Команды:`,
					attachment: "article-194686664_60597_e899de91872d46979d",
					forward: JSON.stringify({
						peer_id: context.peerId,
						conversation_message_ids: context.conversationMessageId,
						is_reply: 1,
					}),
				});
			}
			return;
		}
	}
}

export default groupMessageNew;

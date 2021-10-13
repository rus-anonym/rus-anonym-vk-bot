import { GroupModernMessageContext } from "../../../utils/lib/commands/core";

import InternalUtils from "../../../utils/core";
import DB from "../../../DB/core";
import { SubGroupVK } from "../../core";

function createSubGroupMessageNewHandler(
	subGroup: SubGroupVK,
): (context: GroupModernMessageContext) => Promise<void> {
	return async function groupMessageNew(
		context: GroupModernMessageContext,
	): Promise<void> {
		if (context.isFromGroup) {
			return;
		}

		if (context.isInbox) {
			if (!context.text) {
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

			let selectedCommand = InternalUtils.groupCommands.findCommand({
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				input: context.text!,
				isSelf: context.senderId === DB.config.VK.user.master.id,
				isPrivate: DB.main.config.data.botPrivateAccessList.includes(
					context.senderId,
				),
				isMain: false,
			});

			if (!selectedCommand && context.hasMessagePayload) {
				selectedCommand = InternalUtils.groupCommands.findCommand({
					input: context.messagePayload.cmd || "null",
					isSelf: context.senderId === DB.config.VK.user.master.id,
					isPrivate: DB.main.config.data.botPrivateAccessList.includes(
						context.senderId,
					),
					isMain: false,
				});
			}

			if (selectedCommand) {
				// const TempVK = VK.getVK();
				context.state.args = selectedCommand.regexp.exec(
					context.text,
				) as RegExpExecArray;
				context.state.user = await InternalUtils.group.getUserData(
					context.senderId,
					subGroup.id,
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
				selectedCommand.process(context, subGroup.getVK()).catch((err) => {
					InternalUtils.logger.send({
						message: `Error on execute command\nError: ${err.toString()}`,
						type: "error",
					});
					context.state.sendMessage(
						`При выполнении команды произошла ошибка :(\nСообщите об ошибке @id${DB.config.VK.user.master.id} (разработчику)`,
					);
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
	};
}

export default createSubGroupMessageNewHandler;

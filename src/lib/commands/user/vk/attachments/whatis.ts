import { UserCommand } from "../../../../utils/lib/commands/core";
import InternalUtls from "../../../../utils/core";
import VK from "../../../../VK/core";

new UserCommand(/(?:^!whatis)$/i, async function (message) {
	await message.loadMessagePayload();

	if (message.forwards[0]) {
		const [forwardMessageInfo] = (
			await VK.user.getVK().api.messages.getById({
				message_ids: message.forwards[0].id,
			})
		).items;
		if (
			forwardMessageInfo.attachments &&
			forwardMessageInfo.attachments.length > 0
		) {
			return message.reply({
				disable_mentions: true,
				dont_parse_links: true,
				message: `
Прикрепления:
${await InternalUtls.userCommands.attachmentsToString(
	forwardMessageInfo.attachments,
	forwardMessageInfo.from_id,
)}`,
			});
		}
	}

	if (message.replyMessage) {
		const [replyMessageInfo] = (
			await VK.user.getVK().api.messages.getById({
				message_ids: message.replyMessage.id,
			})
		).items;
		if (
			replyMessageInfo.attachments &&
			replyMessageInfo.attachments.length > 0
		) {
			return message.reply({
				disable_mentions: true,
				dont_parse_links: true,
				message: `
Прикрепления:
${await InternalUtls.userCommands.attachmentsToString(
	replyMessageInfo.attachments,
	replyMessageInfo.from_id,
)}`,
			});
		}
	}

	if (message.hasAttachments()) {
		const [messageInfo] = (
			await VK.user.getVK().api.messages.getById({
				message_ids: message.id,
			})
		).items;
		if (messageInfo.attachments && messageInfo.attachments.length > 0) {
			return message.reply({
				disable_mentions: true,
				dont_parse_links: true,
				message: `
Прикрепления:
${await InternalUtls.userCommands.attachmentsToString(
	messageInfo.attachments,
	messageInfo.from_id,
)}`,
			});
		}
	}

	return message.editMessage({
		disable_mentions: true,
		message: `Не нашёл прикреплений`,
		dont_parse_links: true,
	});
});

import { ContextDefaultState, getRandomId, MessageFlagsContext } from "vk-io";

import InternalUtils from "../../../utils/core";
import DB from "../../../DB/core";
import VK from "../../../VK/core";
import moment from "moment";

async function userMessageFlagsHandler(
	event: MessageFlagsContext<ContextDefaultState>,
): Promise<void> {
	if (event.isDeletedForAll) {
		const deletedMessageData = await DB.models.message.findOne({
			id: event.id,
		});

		if (!deletedMessageData) {
			InternalUtils.logger.send(
				`Удалено сообщение #${event.id}, но в БД нет данных об этом сообщении(`,
				"error",
			);
			return;
		}

		if (deletedMessageData.isOutbox) {
			return;
		}

		const deletedMessageText =
			deletedMessageData.data[deletedMessageData.data.length - 1].text;

		const logsChatId =
			deletedMessageData.peerType === "chat"
				? DB.config.vk.logs.conversations.conversations
				: DB.config.vk.logs.conversations.messages;

		const uploadedAttachments = await VK.group.uploadAttachments(
			deletedMessageData.data[deletedMessageData.data.length - 1].attachments,
			logsChatId,
		);

		let attachmentsText = "";

		for (let i = 0; i < uploadedAttachments.length; i++) {
			attachmentsText += `\n${Number(i) + 1}. ${uploadedAttachments[i].type}`;
		}

		VK.group.getVK().api.messages.send({
			message: `Удалено сообщение #id${event.id} от ${moment(
				deletedMessageData.created,
			).format("HH:mm:ss, DD.MM.YYYY")}
Отправитель: @id${deletedMessageData.senderId}
#from_id${deletedMessageData.senderId}

Текст сообщения: ${deletedMessageText || "Отсутствует"}

Прикрепления: ${attachmentsText || "Отсутствуют"}`,
			chat_id: logsChatId,
			random_id: getRandomId(),
			attachment: uploadedAttachments.map((x) => x.link),
		});
	}
}

export default userMessageFlagsHandler;

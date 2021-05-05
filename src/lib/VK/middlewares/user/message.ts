import { MessageContext } from "vk-io";

import InternalUtils from "../../../utils/core";
import DB from "../../../DB/core";

async function handler(message: MessageContext) {
	DB.saveMessage(message).catch(() => {
		InternalUtils.logger.send(
			`Error on save message #${message.id}\n
https://vk.com/im?sel=${
				message.isChat ? `c${message.chatId}` : message.peerId
			}&msgid=${message.id}`,
			"error",
		);
	});
}

export default handler;

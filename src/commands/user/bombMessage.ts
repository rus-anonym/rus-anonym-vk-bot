import { getRandomId } from "vk-io";
import { userVK } from "../../plugins/userVK";
import { ModernUserMessageContext } from "./../../plugins/types";
export = {
	regexp: /^(?:исчез|bomb)\s([0-9]+)?\s?([^]+)?/i,
	process: async function (message: ModernUserMessageContext) {
		let attachmentsList = [];
		for (let i in message.attachments) {
			attachmentsList.push(message.attachments[i].toString());
		}
		let ttl = Number(message.args[1]);
		if (ttl > 86399) {
			ttl = 86399;
		} else if (ttl < 0) {
			ttl = 1;
		}
		return await userVK.api.messages.send({
			peer_id: message.peerId,
			expire_ttl: ttl,
			message: message.args[2],
			attachment: attachmentsList.join(),
			random_id: getRandomId(),
		});
	},
};

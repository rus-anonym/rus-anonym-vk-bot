import { ModernUserMessageContext } from "./../../plugins/types";
import { userVK } from "../../plugins/userVK";

export = {
	regexp: /^(?:screen|скрин)$/i,
	process: async function (message: ModernUserMessageContext) {
		return await userVK.api.call(`messages.sendService`, {
			peer_id: message.peerId,
			action_type: `chat_screenshot`,
		});
	},
};

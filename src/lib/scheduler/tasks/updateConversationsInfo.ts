import { Interval } from "simple-scheduler-task";

import InternalUtils from "../../utils/core";
import VK from "../../VK/core";
import DB from "../../DB/core";

async function updateConversationsInfo(): Promise<{
	update: number;
	delete: number;
}> {
	const response = {
		update: 0,
		delete: 0,
	};
	for await (const conversation of DB.main.models.vkConversation.find()) {
		try {
			const conversationInfo = await VK.fakes
				.getUserFakeAPI()
				.messages.getChatPreview({
					link: conversation.link,
				});
			conversation.members = conversationInfo.preview.members;
			conversation.updateDate = new Date();
			conversation.markModified("members");
			response.update++;
			await conversation.save();
		} catch {
			response.delete++;
			await conversation.delete();
		}
	}
	return response;
}

export default new Interval({
	isInform: true,
	type: "updateConversationsInfo",
	source: updateConversationsInfo,
	cron: "0 12 * * *",
	onDone: (log) => {
		InternalUtils.logger.send({
			message: `Данные о беседах обновлены
Обновлено: ${log.response.update}
Удалено: ${log.response.delete}`,
			type: "info",
		});
	},
});

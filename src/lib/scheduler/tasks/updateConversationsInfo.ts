import { Interval } from "simple-scheduler-task";
import { getRandomId } from "vk-io";

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
	cron: "0 */12 * * *",
	onDone: (log) => {
		VK.group.getAPI().messages.send({
			random_id: getRandomId(),
			chat_id: DB.config.VK.group.logs.conversations.conversationsTrack,
			message: `Данные о беседах обновлены
Обновлено: ${(log.response as any).update}
Удалено: ${(log.response as any).delete}`,
		});
	},
});

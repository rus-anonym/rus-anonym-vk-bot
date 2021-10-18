import { Interval } from "simple-scheduler-task";
import { getRandomId } from "vk-io";
import moment from "moment";

import VK from "../../VK/core";
import DB from "../../DB/core";

async function updateConversationsInfo(): Promise<{
	update: number;
	delete: number;
	outdated: number;
	total: number;
}> {
	const response = {
		update: 0,
		delete: 0,
		outdated: 0,
		total: 0,
	};

	const minimalUpdateDate = moment().subtract(1, "day").toDate();
	response.total = await DB.main.models.vkConversation.count();
	const perUpdate = response.total / (24 * 12) + 5;

	for await (const conversation of DB.main.models.vkConversation
		.find({
			updateDate: {
				$lt: minimalUpdateDate,
			},
		})
		.limit(perUpdate)) {
		try {
			const conversationInfo = await VK.fakes
				.getUserFakeAPI()
				.messages.getChatPreview({
					link: conversation.link,
				});
			conversation.title = conversationInfo.preview.title;
			conversation.members = conversationInfo.preview.members;
			conversation.updateDate = new Date();
			conversation.markModified("members");
			++response.update;
			await conversation.save();
		} catch {
			++response.delete;
			await conversation.delete();
		}
	}

	response.outdated = await DB.main.models.vkConversation.count({
		updateDate: {
			$lt: minimalUpdateDate,
		},
	});

	return response;
}

export default new Interval({
	isInform: true,
	type: "updateConversationsInfo",
	source: updateConversationsInfo,
	cron: "*/5 * * * *",
	plannedTime: Date.now(),
	onDone: (log) => {
		VK.group.getAPI().messages.send({
			random_id: getRandomId(),
			chat_id: DB.config.VK.group.logs.conversations.conversationsTrack,
			message: `Данные о беседах обновлены
Обновлено: ${(log.response as any).update}
Удалено: ${(log.response as any).delete}
Устаревших: ${(log.response as any).outdated}`,
		});
	},
});

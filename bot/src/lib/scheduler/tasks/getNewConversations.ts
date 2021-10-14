import { Interval } from "simple-scheduler-task";
import utils from "rus-anonym-utils";
import { getRandomId } from "vk-io";

import VK from "../../VK/core";
import DB from "../../DB/core";

async function getNewConversations(): Promise<string[]> {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const lastPosts = (
		await VK.fakes.getUserFakeAPI().newsfeed.search({
			q: `"vk.me/join/"`,
			count: 200,
		})
	).items!;

	const newConversations: string[] = [];

	for (const post of lastPosts) {
		if (!post.text) {
			continue;
		}
		const links = post.text.match(/(vk.me\/join\/(?:[\w/=]+))/gi);
		if (!links) {
			continue;
		}
		for (const link of links) {
			try {
				const dbInfo = await DB.main.models.vkConversation.findOne({
					link: "https://" + link,
				});
				if (!dbInfo) {
					const conversationInfo = await VK.fakes
						.getUserFakeAPI()
						.messages.getChatPreview({
							link,
						});
					await DB.main.models.vkConversation.insertMany({
						link: "https://" + link,
						title: conversationInfo.preview.title,
						ownerId: conversationInfo.preview.admin_id,
						members: conversationInfo.preview.members,
						updateDate: new Date(),
						regDate: new Date(),
					});
					newConversations.push(link);
				}
			} catch (error) {
				//
			}
		}
	}

	return newConversations;
}

export default new Interval({
	plannedTime: Date.now(),
	isInform: true,
	type: "getNewConversations",
	source: getNewConversations,
	cron: "*/5 * * * *",
	onDone: (log) => {
		if ((log.response as string[]).length !== 0) {
			VK.group.getAPI().messages.send({
				random_id: getRandomId(),
				chat_id: DB.config.VK.group.logs.conversations.conversationsTrack,
				message: `Добавил ${
					(log.response as string[]).length
				} ${utils.string.declOfNum((log.response as string[]).length, [
					"новую беседу",
					"новые беседы",
					"новых бесед",
				])}
${(log.response as string[])
	.map((item, index) => `${index + 1}. ${item}`)
	.join("\n")}`,
			});
		}
	},
});

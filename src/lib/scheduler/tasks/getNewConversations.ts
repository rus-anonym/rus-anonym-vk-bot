import { Interval } from "simple-scheduler-task";

import InternalUtils from "../../utils/core";
import VK from "../../VK/core";
import DB from "../../DB/core";

async function getNewConversations(): Promise<number> {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const lastPosts = (
		await VK.fakes.getUserFakeAPI().newsfeed.search({
			q: `"vk.me/join/"`,
			count: 200,
		})
	).items!;

	let newConversations = 0;

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
				const dbInfo = await DB.main.models.vkConversation.find({
					link: "https://" + link,
				});
				if (!dbInfo) {
					const conversationInfo = await VK.fakes
						.getUserFakeAPI()
						.messages.getChatPreview({
							link,
						});
					await DB.main.models.vkConversation.insertOne({
						link: "https://" + link,
						ownerId: conversationInfo.preview.admin_id,
						members: conversationInfo.preview.members,
						updateDate: new Date(),
						regDate: new Date(),
					});
					newConversations++;
				}
			} catch (error) {
				//
			}
		}
	}

	return newConversations;
}

export default new Interval({
	isInform: true,
	type: "getNewConversations",
	source: getNewConversations,
	cron: "*/5 * * * *",
	onDone: (log) => {
		if (log.response !== 0) {
			InternalUtils.logger.send({
				message: `Добавил ${log.response} новых бесед`,
				type: "info",
			});
		}
	},
});

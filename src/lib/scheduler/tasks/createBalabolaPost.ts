import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";

import VK from "../../VK/core";
import DB from "../../DB/core";

async function createBalabolaPost() {
	const [oldPost] = (
		await VK.user.getVK().api.wall.get({
			owner_id: -DB.config.VK.group.id,
			count: 1,
		})
	).items;
	const balaboba = await utils.yandex.balaboba.generate(
		oldPost.text || "Привет, я RusAnonym Bot",
	);
	await VK.user.getVK().api.wall.post({
		owner_id: -DB.config.VK.group.id,
		from_group: true,
		message: balaboba.response,
	});
}

export default new Interval({
	source: createBalabolaPost,
	cron: "*/30 * * * *",
	type: "createBalabolaPost",
});

import { Interval } from "simple-scheduler-task";
import { GroupsGetExtendedResponse } from "vk-io/lib/api/schemas/responses";

import DB from "../../DB/core";
import VK from "../../VK/core";

async function updateReserveGroupsList() {
	const groups = (await VK.user.getAPI().groups.get({
		extended: true,
		filter: ["admin"],
	})) as GroupsGetExtendedResponse;
	const reserveGroups = groups.items.filter(
		(x) => x.name.startsWith("Reserve") && !x.deactivated,
	);
	await DB.main.models.reserveGroup.updateMany({
		$pull: {
			id: {
				$nin: reserveGroups.map((x) => x.id),
			},
		},
	});
	for (const group of reserveGroups) {
		let groupInDB = await DB.main.models.reserveGroup.findOne({
			id: group.id,
		});
		if (!groupInDB) {
			groupInDB = new DB.main.models.reserveGroup({
				id: group.id,
			});
		}
		if (groupInDB.domain !== group.screen_name) {
			groupInDB.domain = group.screen_name;
			groupInDB.markModified("domain");
		}
		groupInDB.isReserve = group.screen_name !== `club${group.id}`;
		groupInDB.markModified("isReserve");
		await groupInDB.save();
		if (group.is_closed !== 2) {
			await VK.user.getAPI().groups.edit({
				group_id: group.id,
				access: 2,
			});
		}
	}
}

export default new Interval({
	isInform: true,
	type: "updateReserveGroupsList",
	source: updateReserveGroupsList,
	plannedTime: Date.now(),
	cron: "*/5 * * * *",
});

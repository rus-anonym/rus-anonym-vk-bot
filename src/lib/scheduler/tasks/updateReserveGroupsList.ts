import { Interval } from "simple-scheduler-task";
import { GroupsGetObjectExtendedResponse } from "vk-io/lib/api/schemas/responses";

import DB from "../../DB/core";
import InternalUtils from "../../utils/core";
import VK from "../../VK/core";

async function updateReserveGroupsList() {
	const masterGroups = (await VK.master.getAPI().groups.get({
		extended: true,
		filter: ["admin"],
	})) as unknown as GroupsGetObjectExtendedResponse;
	const slaveGroups = (await VK.slave.getAPI().groups.get({
		extended: true,
		filter: ["admin"],
	})) as unknown as GroupsGetObjectExtendedResponse;
	const masterReserveGroups = masterGroups.items.filter(
		(x) => x.name.startsWith("Reserve") && !x.deactivated,
	);
	const slaveReserveGroyps = slaveGroups.items.filter(
		(x) => x.name.startsWith("Reserve") && !x.deactivated,
	);
	const reserveGroups = [...masterReserveGroups, ...slaveReserveGroyps];
	await DB.main.models.reserveGroup.deleteMany({
		id: {
			$nin: reserveGroups.map((x) => x.id),
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
		if (masterReserveGroups.find((x) => x.id === group.id)) {
			groupInDB.ownerId = DB.config.VK.user.master.id;
		} else {
			groupInDB.ownerId = DB.config.VK.user.slave.id;
		}
		if (group.is_closed !== 2) {
			if (groupInDB.ownerId === DB.config.VK.user.master.id) {
				await VK.master.getAPI().groups.edit({
					group_id: group.id,
					access: 2,
				});
			} else {
				await VK.slave.getAPI().groups.edit({
					group_id: group.id,
					access: 2,
				});
			}
		}
		await groupInDB.save();
	}

	const freeReserveGroupsCount = await DB.main.models.reserveGroup
		.find({
			isReserve: false,
		})
		.countDocuments();

	if (freeReserveGroupsCount < 25) {
		const newGroup = await VK.slave.getAPI().groups.create({
			title: "Reserve group",
		});
		await VK.slave.getAPI().groups.edit({
			group_id: newGroup.id,
			access: 2,
		});
		await DB.main.models.reserveGroup.insertMany({
			id: newGroup.id,
			domain: "id" + newGroup.id,
			isReserve: false,
			ownerId: DB.config.VK.user.slave.id,
		});
		await InternalUtils.logger.send({
			message: `Создана новая группа для резервирования\n@club${newGroup.id}`,
			type: "info",
		});
	}
}

export default new Interval({
	isInform: true,
	type: "updateReserveGroupsList",
	source: updateReserveGroupsList,
	plannedTime: Date.now(),
	cron: "*/5 * * * *",
});

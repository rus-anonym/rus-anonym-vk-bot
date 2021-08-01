import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";

import InternalUtils from "../../utils/core";
import VK from "../../VK/core";
import DB from "../../DB/core";

async function updateOnlinePrivacySettings(): Promise<string | void> {
	let usersSeeOnlineStatus: number[] = [];

	for (const list_id of DB.config.VK.user.friends.list.viewOnline) {
		const list = await VK.user.main.api.friends.get({
			list_id,
		});

		usersSeeOnlineStatus = usersSeeOnlineStatus.concat(list.items);
	}

	const uniqueUsersList = utils.array.makeUnique(usersSeeOnlineStatus);

	const currentUsersSeeOnlineStatus = (
		await VK.user.getVK().api.call("account.getPrivacySettings", {})
	).settings.find((x: { key: string }) => x.key === "online").value.owners
		.allowed as number[];

	if (
		utils.array.number.total(uniqueUsersList) !==
		utils.array.number.total(currentUsersSeeOnlineStatus)
	) {
		const newUsersWhoSeeOnline = uniqueUsersList.filter(
			(x) => currentUsersSeeOnlineStatus.indexOf(x) < 0,
		);
		const usersWhoNotSeeOnline = currentUsersSeeOnlineStatus.filter(
			(x) => uniqueUsersList.indexOf(x) < 0,
		);
		await VK.user.getVK().api.call("account.setPrivacy", {
			key: "online",
			value: uniqueUsersList,
		});
		const usersInfo = await VK.group.getVK().api.users.get({
			user_ids: utils.array
				.makeUnique(newUsersWhoSeeOnline.concat(usersWhoNotSeeOnline))
				.join(),
		});
		let text = "";
		let i = 0;
		if (newUsersWhoSeeOnline.length > 0) {
			text += `Данным пользователя дано право на просмотр статуса онлайна:`;
			for (const user of newUsersWhoSeeOnline) {
				const userData = usersInfo.find((x) => x.id === user);
				if (userData) {
					++i;
					text += `\n${i}. @id${userData.id} (${userData.first_name}  ${userData.last_name})`;
				}
			}
		}
		if (usersWhoNotSeeOnline.length > 0) {
			i = 0;
			text += `${
				text === "" ? "" : "\n\n"
			}У данных пользователей право на просмотр статуса онлайна убрано:`;
			for (const user of usersWhoNotSeeOnline) {
				const userData = usersInfo.find((x) => x.id === user);
				if (userData) {
					++i;
					text += `\n${i}. @id${userData.id} (${userData.first_name}  ${userData.last_name})`;
				}
			}
		}
		return text;
	} else {
		return;
	}
}

export default new Interval({
	isInform: true,
	type: "updateOnlinePrivacySettings",
	source: updateOnlinePrivacySettings,
	cron: "*/30 * * * *",
	onDone: (log) => {
		if (log.response) {
			InternalUtils.logger.send({ message: `${log.response}`, type: "info" });
		}
	},
});

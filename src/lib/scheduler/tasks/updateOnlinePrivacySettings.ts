import utils from "rus-anonym-utils";
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

	const usersSeeOnlineDiff = currentUsersSeeOnlineStatus.filter((x) => {
		return uniqueUsersList.indexOf(x) < 0;
	});

	if (usersSeeOnlineDiff.length > 0) {
		await VK.user.getVK().api.call("account.setPrivacy", {
			key: "online",
			value: uniqueUsersList,
		});
		let text = `Данным пользователя дано право на просмотр статуса онлайна:`;
		const usersInfo = await VK.group.getVK().api.users.get({
			user_ids: uniqueUsersList.join(),
		});
		for (let i = 0; i < usersInfo.length; ++i) {
			text += `\n${Number(i) + 1}. @id${usersInfo[i].id} (${
				usersInfo[i].first_name
			} ${usersInfo[i].last_name})`;
		}
		return text;
	} else {
		return;
	}
}

export default updateOnlinePrivacySettings;

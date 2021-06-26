import utils from "rus-anonym-utils";
import moment from "moment";
import { FriendActivityContext } from "vk-io";

import InternalUtils from "../../../utils/core";

async function userFriendActivityHandler(
	event: FriendActivityContext,
): Promise<void> {
	const userData = await InternalUtils.user.getUserData(event.userId as number);
	if (userData.info.last_seen) {
		if (!(userData.info.last_seen.isOnline && event.isOnline)) {
			InternalUtils.logger.send(
				`@id${userData.id} (${userData.info.name} ${userData.info.surname}) ${
					event.isOnline
						? `${userData.info.gender === 1 ? "зашла" : "зашёл"} в ВК`
						: `${userData.info.gender === 1 ? "вышла" : "вышел"} из ВК`
				} в ${moment(event.eventAt * 1000).format("HH:mm:ss")}
${
	event.isOffline
		? `Время входа: ${moment(userData.info.last_seen.date).format("HH:mm:ss")}`
		: `Время выхода: ${moment(userData.info.last_seen.date).format("HH:mm:ss")}`
}
${userData.info.gender === 1 ? "Была" : "Был"} ${
					event.isOnline ? "оффлайн" : "онлайн"
				} ${utils.time.precizeDiff(
					moment(userData.info.last_seen.date),
					moment(),
				)}`,
				"friend_activity",
			);
			userData.info.last_seen.date = new Date(event.eventAt * 1000);
			userData.info.last_seen.isOnline = event.isOnline;
		}
	} else {
		userData.info.last_seen = {
			date: new Date(event.eventAt * 1000),
			isOnline: event.isOnline,
		};
	}
	userData.markModified(`info.last_seen`);
	await userData.save();
}

export default userFriendActivityHandler;

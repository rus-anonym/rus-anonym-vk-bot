import moment from "moment";
import { FriendActivityContext } from "vk-io";

import InternalUtils from "../../../utils/core";

async function userFriendActivityHandler(
	event: FriendActivityContext,
): Promise<void> {
	const userData = await InternalUtils.user.getUserData(event.userId as number);
	if (userData.info.last_seen) {
		if (userData.info.last_seen.isOnline && event.isOnline) {
			userData.info.last_seen.date = new Date(event.eventAt * 1000);
			userData.info.last_seen.platform = event.platform as number;
		} else {
			InternalUtils.logger.send(
				`@id${userData.id} (${userData.info.name} ${userData.info.surname}) ${
					event.isOnline
						? `${userData.info.gender === 1 ? "зашла" : "зашёл"} в ВК`
						: `${userData.info.gender === 1 ? "вышла" : "вышел"} в ВК`
				} в ${moment(event.eventAt * 1000).format("HH:mm:ss")}`,
				"rest",
			);
		}
	} else {
		userData.info.last_seen = {
			date: new Date(event.eventAt * 1000),
			platform: event.platform as number,
			isOnline: event.isOnline,
		};
	}
}

export default userFriendActivityHandler;

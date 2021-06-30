import moment from "moment";
import { Interval } from "simple-scheduler-task";

import InternalUtils from "./utils/core";

new Interval({
	source: async () => {
		const users = await InternalUtils.user.getFriendsBirthday(new Date());
		InternalUtils.logger.send(
			`Сегодня ${moment().format("DD.MM.YYYY")} день рождения празднуют:
${users.map((user, index) => {
	return `${index + 1}. @id${user.id}(${user.name} ${user.surname})`;
})}`,
			"info",
		);
	},
	plannedTime: moment()
		.add(1, "day")
		.set("hour", 0)
		.set("minute", 0)
		.set("second", 0)
		.toDate(),
	type: "getBirthdays",
	intervalTimer: 24 * 60 * 60 * 1000,
});

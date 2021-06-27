import moment from "moment";
import { Interval } from "simple-scheduler-task";

moment.locale("ru");

import VK from "./VK/core";
import DB from "./DB/core";
import InternalUtils from "./utils/core";

import "./commands/loader";

DB.connection.once("open", function MongoDBConnected() {
	InternalUtils.logger.send(
		`Connect to DB at ${moment().format("HH:mm:ss.SSS | DD.MM.YYYY")}`,
	);
	VK.user.main.updates.start().then(() => {
		InternalUtils.logger.send(
			`VK User polling start at ${moment().format(
				"HH:mm:ss.SSS | DD.MM.YYYY",
			)}`,
		);
	});
	VK.group.main.updates.start().then(() => {
		InternalUtils.logger.send(
			`VK Group polling start at ${moment().format(
				"HH:mm:ss.SSS | DD.MM.YYYY",
			)}`,
		);
	});
});

new Interval({
	source: async () => {
		const users = await InternalUtils.user.getFriendsBirthday(new Date());
		InternalUtils.logger.send(`
Сегодня ${moment().format("DD.MM.YYYY")} день рождения празднуют:
${users.map((user, index) => {
	return `${index + 1}. @id${user.id}(${user.name} ${user.surname})`;
})}`);
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

process.on("warning", async (warning) => {
	InternalUtils.logger.send(
		`Unhandled warning\n${warning.toString()}`,
		"error",
	);
});
process.on("uncaughtException", async (error) => {
	InternalUtils.logger.send(
		`Unhandled uncaughtException\n${error.toString()}`,
		"error",
	);
});

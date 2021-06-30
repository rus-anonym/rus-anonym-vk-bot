import moment from "moment";
import utils from "rus-anonym-utils";
import * as scheduler from "simple-scheduler-task";

import InternalUtils from "./utils/core";
import DB from "./DB/core";

new scheduler.Interval({
	source: async () => {
		const users = await InternalUtils.user.getFriendsBirthday(new Date());
		return `Сегодня ${moment().format("DD.MM.YYYY")} день рождения празднуют:
${users.map((user, index) => {
	return `${index + 1}. @id${user.id}(${user.name} ${user.surname})`;
})}`;
	},
	plannedTime: moment()
		.add(1, "day")
		.set("hour", 0)
		.set("minute", 0)
		.set("second", 0)
		.toDate(),
	type: "getBirthdays",
	intervalTimer: 24 * 60 * 60 * 1000,
	inform: true,
});

new scheduler.Interval({
	source: async () => {
		const oldMessages = await DB.user.models.message.deleteMany({
			created: {
				$lt: moment().subtract(1, "day").toDate(),
			},
		});
		return `Удалено ${oldMessages.deletedCount} ${utils.string.declOfNum(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			oldMessages.deletedCount!,
			["старое сообщение", "старых сообщения", "старых сообщений"],
		)}`;
	},
	plannedTime: moment().toDate(),
	type: "cleanOldMessages",
	intervalTimer: 24 * 60 * 60 * 1000,
	inform: true,
});

scheduler.events.on("executions", (execution) => {
	InternalUtils.logger.send(
		`Выполнена запланированная задача:
Время выполнения: ${execution.executionTime}ms
Тип: ${execution.task.type}
Следующее выполнение: ${moment(execution.task.nextExecute).format(
			"DD.MM.YYYY, HH:mm:ss",
		)}
${
	typeof execution.response === "string" ? "Ответ: " + execution.response : ""
}`,
		"info",
	);
});

scheduler.events.on("errors", (error) => {
	InternalUtils.logger.send(
		`Ошибки при выполнении запланированной задача:
Время выполнения: ${error.executionTime}ms
Тип: ${error.task.type}
Следующее выполнение: ${moment(error.task.nextExecute).format(
			"DD.MM.YYYY, HH:mm:ss",
		)}
Ошибка: ${error.error.toString()}`,
		"info",
	);
});

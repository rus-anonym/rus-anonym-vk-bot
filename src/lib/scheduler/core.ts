import * as scheduler from "simple-scheduler-task";
import moment from "moment";

import InternalUtils from "../utils/core";

import updateUserData from "./tasks/updateUsersData";
import cleanOldMessages from "./tasks/cleanOldMessages";
import getBirthdays from "./tasks/getBirthdays";

new scheduler.Interval({
	source: getBirthdays,
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
	source: cleanOldMessages,
	plannedTime: moment().toDate(),
	type: "cleanOldMessages",
	intervalTimer: 24 * 60 * 60 * 1000,
	inform: true,
});

new scheduler.Interval({
	source: updateUserData,
	plannedTime: moment().toDate(),
	intervalTimer: 30 * 60 * 1000,
	inform: true,
	type: "updateUsersData",
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

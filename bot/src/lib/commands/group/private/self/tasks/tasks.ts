import moment from "moment";
import utils from "rus-anonym-utils";

import { GroupCommand } from "../../../../../utils/lib/commands/core";

import tasks from "../../../../../scheduler/core";
import { TSchedulerTaskStatus } from "simple-scheduler-task/dist/cjs/types/Task";

const validStatus = (type: TSchedulerTaskStatus): string => {
	switch (type) {
		case "await":
			return `Ожидается выполнение`;
		case "done":
			return "Выполнена";
		case "pause":
			return "Приостановлена";
		case "process":
			return "Выполняется";
		default:
			return "Неизвестно";
	}
};

new GroupCommand({
	isMain: true,
	isSelf: true,
	regexp: /(?:^!tasks)$/i,
	process: async function (message) {
		for (const chunk of utils.array.splitTo(
			Object.entries(tasks).map((x) => x[1]),
			10,
		)) {
			await message.state.sendMessage({
				message: `Текущие задачи:`,
				template: JSON.stringify({
					type: "carousel",
					elements: chunk.map((x) => {
						return {
							title: x.meta.type,
							description: `Следующее выполнение: ${moment(
								x.nextExecute,
							).format("DD.MM.YYYY, HH:mm:ss")}
Статус: ${validStatus(x.status)}`,
							buttons: [
								{
									action: {
										type: "text",
										label:
											x.status !== "pause"
												? "Приостановить задачу"
												: "Продолжить выполнение",
									},
									color: x.status !== "pause" ? "negative" : "positive",
								},
							],
						};
					}),
				}),
			});
		}
	},
});

// import moment from "moment";
// import utils from "rus-anonym-utils";

// import { GroupCommand } from "../../../../utils/lib/commands/core";

// import tasks from "../../../../scheduler/core";

// import { TSchedulerTaskStatus } from "simple-scheduler-task/dist/cjs/types/tasks";

// const validStatus = (type: TSchedulerTaskStatus): string => {
// 	if (type === "await") {
// 		return `Ожидается выполнение`;
// 	}
// 	if (type === "done") {
// 		return "Выполнена";
// 	}
// 	if (type === "pause") {
// 		return "Приостановлена";
// 	}
// 	if (type === "process") {
// 		return "Выполняется";
// 	}
// 	return "Неизвестно";
// };

// new GroupCommand({
// 	isSelf: true,
// 	regexp: /(?:^!tasks)$/i,
// 	process: async function (message) {
// 		for (const chunk of utils.array.splitTo(
// 			Object.entries(tasks).map((x) => x[1]),
// 			10,
// 		)) {
// 			await message.state.sendMessage({
// 				message: `Текущие задачи:`,
// 				template: JSON.stringify({
// 					type: "carousel",
// 					elements: chunk.map((x) => {
// 						return {
// 							title: x.info.type,
// 							description: `Следующее выполнение: ${moment(
// 								x.nextExecute,
// 							).format("DD.MM.YYYY, HH:mm:ss")}
// Статус: ${validStatus(x.info.status)}`,
// 							buttons: [
// 								{
// 									action: {
// 										type: "text",
// 										label:
// 											x.info.status !== "pause"
// 												? "Приостановить задачу"
// 												: "Продолжить выполнение",
// 									},
// 									color: x.info.status !== "pause" ? "negative" : "positive",
// 								},
// 							],
// 						};
// 					}),
// 				}),
// 			});
// 		}
// 	},
// });

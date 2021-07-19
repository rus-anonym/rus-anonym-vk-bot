import utils from "rus-anonym-utils";
import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand(
	/(?:^выбери число)(?:\sот(?:\s?)(\d+)(?:\s?)(?:(?:до)?)(?:\s?)(?:(\d+)?))?$/i,
	async function (message) {
		if (!message.args[1]) {
			const firstNum = utils.number.getRandomInt(0, 50);
			const secondNum = utils.number.getRandomInt(50, 100);
			return message.sendMessage({
				message: `Поскольку границы для выбора числа не были выбраны, я выбирал число от ${firstNum} до ${secondNum}
Я выбираю число ${utils.number.getRandomInt(firstNum, secondNum)}
Границы выбора: ${firstNum} и ${secondNum}`,
			});
		}
		if (!message.args[2]) {
			const secondNum = utils.number.getRandomInt(
				Number(message.args[1]),
				Number(message.args[1]) * 3,
			);
			return message.sendMessage({
				message: `Поскольку вы не установили верхней границы для выбора числа, я решил что она будет равна ${secondNum}
Я выбираю число ${utils.number.getRandomInt(Number(message.args[1]), secondNum)}
Границы выбора: ${Number(message.args[1])} и ${secondNum}`,
			});
		}
		return message.sendMessage({
			message: `Я выбираю число ${utils.number.getRandomInt(
				Number(message.args[1]),
				Number(message.args[2]),
			)}
Границы выбора: ${Number(message.args[1])} и ${Number(message.args[2])}`,
		});
	},
);

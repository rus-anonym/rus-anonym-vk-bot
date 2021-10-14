import moment from "moment";
import utils from "rus-anonym-utils";
import { Keyboard } from "vk-io";

import InternalUtils from "../../../../utils/core";

import { GroupCommand } from "../../../../utils/lib/commands/core";

const generateMainText = (): string => {
	const memoryData = process.memoryUsage();
	return `Process:
RSS: ${InternalUtils.commands.bytesToSize(memoryData.rss)}
Heap Total: ${InternalUtils.commands.bytesToSize(memoryData.heapTotal)}
Heap Used: ${InternalUtils.commands.bytesToSize(memoryData.heapUsed)}
V8 External Memory: ${InternalUtils.commands.bytesToSize(memoryData.external)}

Запущен ${utils.time.precizeDiff(
		moment().subtract(process.uptime(), "second"),
		moment(),
	)} назад`;
};

new GroupCommand({
	isMain: true,
	isSelf: true,
	regexp: /(?:^main)$/i,
	process: async function (message) {
		return await message.state.sendMessage({
			message:
				generateMainText() +
				`\nЗадержка: ${Date.now() - message.createdAt * 1000}ms`,
			keyboard: Keyboard.builder()
				.textButton({
					label: "Список задач",
					payload: {
						cmd: "!tasks",
					},
				})
				.row()
				.textButton({
					label: "Главная страница",
					payload: {
						cmd: "main",
					},
					color: Keyboard.POSITIVE_COLOR,
				})
				.inline(),
		});
	},
});

import moment from "moment";
import utils from "rus-anonym-utils";
import { GroupCommand } from "../../../utils/lib/commands/core";

new GroupCommand({
	regexp: /^(?:апи|api)$/i,
	process: async function (message) {
		const VK_API_STATUS = await utils.vk.api.status();

		return message.state.sendMessage({
			message: `Состояние API VK на ${moment().format("HH:mm:ss, DD.MM.YYYY")}
\n${VK_API_STATUS.map((section) => {
				return `${section.section} - ${section.performance}ms (uptime: ${section.uptime}%)\n`;
			}).join("")}
VK API Logs: https://vk.me/join/AJQ1dxhtshwVD3ckSMDG9AEU`,
		});
	},
});

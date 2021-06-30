import moment from "moment";
import utils from "rus-anonym-utils";
import { UserCommand } from "../../../utils/lib/commands";

new UserCommand(/(?:^!api|!апи)$/i, async function (message) {
	const VK_API_STATUS = await utils.vk.api.status();

	return message.editMessage({
		message: `Состояние API VK на ${moment().format("HH:mm:ss, DD.MM.YYYY")}
\n${VK_API_STATUS.map((section) => {
			return `${section.section} - ${section.performance}ms (uptime: ${section.uptime}%)\n`;
		}).join("")}`,
	});
});

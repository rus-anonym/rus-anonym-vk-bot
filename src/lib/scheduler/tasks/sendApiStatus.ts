import moment from "moment";
import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";
import { getRandomId } from "vk-io";

import DB from "../../DB/core";
import VK from "../../VK/core";

async function sendApiStatus() {
	const VK_API_STATUS = await utils.vk.api.status();
	await VK.group.getAPI().messages.send({
		random_id: getRandomId(),
		chat_id: DB.config.VK.group.logs.conversations.api,
		message: `Состояние API VK на ${moment().format("HH:mm:ss, DD.MM.YYYY")}
\n${VK_API_STATUS.map((section) => {
			return `${section.section} - ${section.performance}ms (uptime: ${section.uptime}%)\n`;
		}).join("")}`,
	});
}

export default new Interval({
	isInform: true,
	type: "sendApiStatus",
	source: sendApiStatus,
	plannedTime: Date.now(),
	cron: "* * * * *",
});

import moment from "moment";
import utils from "rus-anonym-utils";
import types from "rus-anonym-utils/dist/lib/VK/types";
import { Interval } from "simple-scheduler-task";
import { getRandomId } from "vk-io";

import DB from "../../DB/core";
import VK from "../../VK/core";

let VK_API_STATUS: types.IVKAPIStatus[] | null = null;

const compareStatuses = (NEW_VK_API_STATUS: types.IVKAPIStatus[]) => {
	if (VK_API_STATUS) {
		let isChange = false;
		for (const sectionIndex in NEW_VK_API_STATUS) {
			const currentSection = NEW_VK_API_STATUS[sectionIndex];
			const oldSection = VK_API_STATUS[sectionIndex];
			if (Math.abs(oldSection.performance - currentSection.performance) > 10) {
				isChange = true;
			}
			if (currentSection.uptime !== 100) {
				isChange = true;
			}
			return isChange;
		}
	} else {
		return false;
	}
};

async function sendApiStatus() {
	const NEW_VK_API_STATUS = await utils.vk.api.status();
	if (VK_API_STATUS && compareStatuses(NEW_VK_API_STATUS)) {
		let message = "";
		for (const section of NEW_VK_API_STATUS) {
			const oldSectionData = VK_API_STATUS.find(
				(x) => x.section === section.section,
			);

			if (oldSectionData) {
				message += `${section.section} [${section.performance}ms] ${
					section.performance === oldSectionData.performance
						? ""
						: section.performance < oldSectionData.performance
						? `(${section.performance - oldSectionData.performance}ms)`
						: `(+${section.performance - oldSectionData.performance}ms)`
				} - ${section.uptime}% ${
					section.uptime === oldSectionData.uptime
						? ""
						: section.uptime < oldSectionData.uptime
						? `(${section.uptime - oldSectionData.uptime}%)`
						: `(+${section.uptime - oldSectionData.uptime}%)`
				}\n`;
			}
		}
		await VK.group.getAPI().messages.send({
			random_id: getRandomId(),
			chat_id: DB.config.VK.group.logs.conversations.api,
			message: `Состояние API VK на ${moment().format("HH:mm:ss, DD.MM.YYYY")}
\n${message}`,
		});
	}
	VK_API_STATUS = NEW_VK_API_STATUS;
}

export default new Interval({
	isInform: true,
	type: "sendApiStatus",
	source: sendApiStatus,
	cron: "* * * * *",
});

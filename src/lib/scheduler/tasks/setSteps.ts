import moment from "moment";
import { Interval } from "simple-scheduler-task";

import VK from "../../VK/core";

async function getBirthdays(): Promise<void> {
	const currentDate = moment().add(7, "day");
	const array: string[] = [];
	for (let i = 0; i < 63; ++i) {
		array.push(currentDate.subtract(1, "day").format("YYYY-MM-DD"));
	}
	await VK.master.getAPI().call("vkRun.import", {
		steps_list: JSON.stringify(
			array.map((x) => {
				return {
					date: x,
					steps: 80000,
					distance: 50000,
				};
			}),
		),
	});
	await VK.slave.getAPI().call("vkRun.import", {
		steps_list: JSON.stringify(
			array.map((x) => {
				return {
					date: x,
					steps: 80000,
					distance: 50000,
				};
			}),
		),
	});
}

export default new Interval({
	isInform: true,
	type: "getBirthdays",
	source: getBirthdays,
	cron: "5 0 * * *",
});

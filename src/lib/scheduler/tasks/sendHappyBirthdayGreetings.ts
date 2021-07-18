import utils from "rus-anonym-utils";
import moment from "moment";
import { Interval } from "simple-scheduler-task";
import { getRandomId } from "vk-io";

import VK from "../../VK/core";
import DB from "../../DB/core";
import InternalUtils from "../../utils/core";

async function sendHappyBirthdayGreetings() {
	const usersIDs = (await DB.user.models.user.distinct(`id`)) as number[];

	const currentDate = moment().format("D.M");

	let log = "";

	for (const chunk of utils.array.splitTo(usersIDs, 250)) {
		const chunkInfo = await VK.fakes.getUserFakeAPI().users.get({
			user_ids: chunk.map((x) => String(x)),
			fields: ["bdate", "can_write_private_message"],
		});
		for (const user of chunkInfo) {
			if (moment(user.bdate, "D.M.YYYY").format("D.M") === currentDate) {
				for (const fake of VK.fakes.user) {
					try {
						const greeting = (
							await utils.yandex.balaboba.generate(
								`${user.first_name} ${user.last_name} поздравляю с днём рождения!`,
							)
						).text;
						await fake
							.getAPI()
							.messages.send({
								user_id: user.id,
								message: greeting,
								random_id: getRandomId(),
							})
							.catch(() => null);
					} catch (error) {
						await fake
							.getAPI()
							.messages.send({
								user_id: user.id,
								message: `${user.first_name} ${user.last_name} поздравляю с днём рождения!`,
								random_id: getRandomId(),
							})
							.catch(() => null);
					}
					log += `Поздравил @id${user.id} (${user.first_name} ${user.last_name})\n`;
				}
			}
		}
	}

	return log === "" ? null : log;
}

export default new Interval({
	type: "sendHappyBirthdayGreetings",
	source: sendHappyBirthdayGreetings,
	cron: "0 0 * * *",
	onDone: (log) => {
		InternalUtils.logger.send(`${log.response}`, "info");
	},
});

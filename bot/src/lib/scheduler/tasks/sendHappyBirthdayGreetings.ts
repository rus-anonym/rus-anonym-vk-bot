import utils from "rus-anonym-utils";
import moment from "moment";
import { Interval, Timeout } from "simple-scheduler-task";
import { getRandomId, API } from "vk-io";

import VK from "../../VK/core";
import DB from "../../DB/core";
import InternalUtils from "../../utils/core";

async function generateGreetingAndSend({
	api,
	user_id,
	first_name,
	last_name,
}: {
	api: API;
	user_id: number;
	first_name: string;
	last_name: string;
}): Promise<void> {
	try {
		const greeting = (
			await utils.yandex.balaboba.generate(
				`${first_name} ${last_name} поздравляю с днём рождения!`,
			)
		).text;
		await api.messages
			.send({
				user_id,
				message: greeting,
				random_id: getRandomId(),
			})
			.catch(() => null);
	} catch (error) {
		await api.messages
			.send({
				user_id,
				message: `${first_name} ${last_name} поздравляю с днём рождения!`,
				random_id: getRandomId(),
			})
			.catch(() => null);
	}
}

async function sendHappyBirthdayGreetings() {
	const usersIDs = (await DB.user.models.user.distinct(`id`)) as number[];

	const currentDate = moment().add(1, "day").format("D.M");

	let log = "Запланированы поздравления для:\n";

	for (const chunk of utils.array.splitTo(usersIDs, 750)) {
		const chunkInfo = await VK.fakes.getUserFakeAPI().users.get({
			user_ids: chunk.map((x) => String(x)),
			fields: ["bdate", "can_write_private_message"],
		});
		for (const user of chunkInfo) {
			if (moment(user.bdate, "D.M.YYYY").format("D.M") === currentDate) {
				new Timeout({
					source: async () => {
						await Promise.all(
							VK.fakes.list.map((fake) =>
								generateGreetingAndSend({
									api: fake.getAPI(),
									user_id: user.id,
									first_name: user.first_name,
									last_name: user.last_name,
								}),
							),
						);
					},
					cron: "0 0 * * *",
				});

				log += `@id${user.id} (${user.first_name} ${user.last_name})\n`;
			}
		}
	}

	return log === "Запланированы поздравления для:\n" ? null : log;
}

export default new Interval({
	isInform: true,
	type: "sendHappyBirthdayGreetings",
	source: sendHappyBirthdayGreetings,
	cron: "50 23 * * *",
	onDone: (message) => {
		if (message) {
			InternalUtils.logger.send({ message, type: "info" });
		}
	},
});

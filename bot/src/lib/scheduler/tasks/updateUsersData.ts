import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";

import InternalUtils from "../../utils/core";
import DB from "../../DB/core";
import VK from "../../VK/core";

async function updateUsersData(): Promise<string | null> {
	const users = await DB.user.models.user.distinct(`id`);
	const output: string[] = [];
	for (const chunk of utils.array.splitTo(users, 250)) {
		const chunkInfo = await VK.master.getAPI().users.get({
			user_ids: chunk,
			fields: InternalUtils.user.mainUsersGetFields,
		});
		for (const userInfo of chunkInfo) {
			const user = await DB.user.models.user.findOne({ id: userInfo.id });
			if (!user || user.info.isBot) {
				break;
			}
			output.push(
				`\nLog: @id${userInfo.id} (${userInfo.first_name} ${userInfo.last_name})`,
			);
			if (user.info.name !== userInfo.first_name) {
				output.push(
					`Имя изменено: ${user.info.name} => ${userInfo.first_name}`,
				);
			}
			if (user.info.surname !== userInfo.last_name) {
				output.push(
					`Фамилия изменена: ${user.info.surname} => ${userInfo.last_name}`,
				);
			}
			if (
				user.info.extends.domain !== userInfo.domain &&
				user.info.extends.domain !== `id${userInfo.id}` &&
				userInfo.domain !== `id${userInfo.id}`
			) {
				output.push(
					`Ссылка изменена: ${user.info.extends.domain} => ${userInfo.domain}`,
				);
				try {
					await InternalUtils.user.reserveScreenName(user.info.extends.domain);
					output.push(
						`Удачная попытка резервирования @${user.info.extends.domain}`,
					);
				} catch (error) {
					output.push(`Неудачная попытка резервирования домена`);
				}
			}
			if (
				utils.array.last(output) ===
				`\nLog: @id${userInfo.id} (${userInfo.first_name} ${userInfo.last_name})`
			) {
				output.pop();
			} else {
				await InternalUtils.user.updateUserData(userInfo, user);
			}
		}
	}
	return output.length > 0 ? output.join("\n") : null;
}

export default new Interval({
	isInform: true,
	type: "updateUsersData",
	source: updateUsersData,
	cron: "*/30 * * * *",
	onDone: (log, meta) => {
		if (log) {
			InternalUtils.logger.send({
				message: `${log} за ${meta.executionTime}`,
				type: "info",
			});
		}
	},
});

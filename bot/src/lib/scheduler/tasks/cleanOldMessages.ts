import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";
import moment from "moment";

import DB from "../../DB/core";
import InternalUtils from "../../utils/core";

async function cleanOldMessages(): Promise<string> {
	const minimalDate = moment().subtract(1, "day").toDate();

	const oldMessagesCount = (
		await DB.user.models.message
			.find({
				created: {
					$lt: minimalDate,
				},
			})
			.distinct("id")
	).length;

	const upToDateMessages = await DB.user.models.message.count({
		created: { $gt: minimalDate },
	});

	await DB.user.models.message.deleteMany({
		created: {
			$lt: minimalDate,
		},
	});

	return `Удалено ${oldMessagesCount} ${utils.string.declOfNum(
		oldMessagesCount,
		["старое сообщение", "старых сообщения", "старых сообщений"],
	)}
Актуальных сообщений: ${upToDateMessages}
`;
}

export default new Interval({
	isInform: true,
	source: cleanOldMessages,
	type: "cleanOldMessages",
	cron: "0 0 * * *",
	onDone: (log, meta) => {
		InternalUtils.logger.send({
			message: `${log} за ${meta.executionTime}ms`,
			type: "info",
		});
	},
});

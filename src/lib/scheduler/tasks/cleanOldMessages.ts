import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";
import moment from "moment";

import DB from "../../DB/core";
import InternalUtils from "../../utils/core";

async function cleanOldMessages(): Promise<string> {
	const minimalDate = moment().subtract(1, "day").toDate();

	const oldMessages = (await DB.user.models.message
		.find({
			created: {
				$lt: minimalDate,
			},
		})
		.distinct("id")) as number[];

	const upToDateMessages = (await DB.user.models.message
		.find({
			created: {
				$gt: minimalDate,
			},
		})
		.distinct("id")) as number[];

	await DB.user.models.message.deleteMany({
		created: {
			$lt: minimalDate,
		},
	});

	await DB.user.models.user.updateMany({
		$pull: {
			messages: {
				$nin: upToDateMessages,
			},
			personalMessages: {
				$nin: upToDateMessages,
			},
		},
	});

	await DB.user.models.chat.updateMany({
		$pull: {
			messages: {
				$nin: upToDateMessages,
			},
		},
	});

	return `Удалено ${oldMessages.length} ${utils.string.declOfNum(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		oldMessages.length,
		["старое сообщение", "старых сообщения", "старых сообщений"],
	)}
Актуальных сообщений: ${upToDateMessages.length}
`;
}

export default new Interval({
	source: cleanOldMessages,
	type: "cleanOldMessages",
	cron: "0 0 * * *",
	onDone: (log) => {
		InternalUtils.logger.send(
			`${log.response} за ${log.executionTime}ms`,
			"info",
		);
	},
});

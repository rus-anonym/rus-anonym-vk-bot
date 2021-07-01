import moment from "moment";
import utils from "rus-anonym-utils";
import * as scheduler from "simple-scheduler-task";
import { UsersFields } from "vk-io/lib/api/schemas/objects";

import InternalUtils from "./utils/core";
import DB from "./DB/core";
import VK from "./VK/core";

const UsersGetFields: UsersFields[] = [
	"first_name_nom",
	"first_name_gen",
	"first_name_dat",
	"first_name_acc",
	"first_name_ins",
	"first_name_abl",
	"last_name_nom",
	"last_name_gen",
	"last_name_dat",
	"last_name_acc",
	"last_name_ins",
	"last_name_abl",
	"photo_id",
	"verified",
	"sex",
	"bdate",
	"city",
	"country",
	"home_town",
	"has_photo",
	"photo_50",
	"photo_100",
	"photo_200_orig",
	"photo_200",
	"photo_400",
	"photo_400_orig",
	"photo_max",
	"photo_max_orig",
	"photo_max_size",
	"online",
	"lists",
	"domain",
	"has_mobile",
	"contacts",
	"site",
	"education",
	"universities",
	"schools",
	"status",
	"last_seen",
	"followers_count",
	"counters",
	"common_count",
	"occupation",
	"nickname",
	"relatives",
	"relation",
	"personal",
	"connections",
	"exports",
	"wall_comments",
	"activities",
	"interests",
	"music",
	"movies",
	"tv",
	"books",
	"games",
	"about",
	"quotes",
	"can_post",
	"can_see_all_posts",
	"can_see_audio",
	"can_write_private_message",
	"can_send_friend_request",
	"is_favorite",
	"is_hidden_from_feed",
	"timezone",
	"screen_name",
	"maiden_name",
	"crop_photo",
	"is_friend",
	"friend_status",
	"career",
	"military",
	"blacklisted",
	"blacklisted_by_me",
	"can_subscribe_posts",
	"descriptions",
	"trending",
	"mutual",
	"friendship_weeks",
	"can_invite_to_chats",
	"stories_archive_count",
	"video_live_level",
	"video_live_count",
	"clips_count",
	"service_description",
	"is_dead",
];

new scheduler.Interval({
	source: async () => {
		const users = await InternalUtils.user.getFriendsBirthday(new Date());
		return `Сегодня ${moment().format("DD.MM.YYYY")} день рождения празднуют:
${users.map((user, index) => {
	return `${index + 1}. @id${user.id}(${user.name} ${user.surname})`;
})}`;
	},
	plannedTime: moment()
		.add(1, "day")
		.set("hour", 0)
		.set("minute", 0)
		.set("second", 0)
		.toDate(),
	type: "getBirthdays",
	intervalTimer: 24 * 60 * 60 * 1000,
	inform: true,
});

new scheduler.Interval({
	source: async () => {
		const oldMessages = await DB.user.models.message.deleteMany({
			created: {
				$lt: moment().subtract(1, "day").toDate(),
			},
		});
		return `Удалено ${oldMessages.deletedCount} ${utils.string.declOfNum(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			oldMessages.deletedCount!,
			["старое сообщение", "старых сообщения", "старых сообщений"],
		)}`;
	},
	plannedTime: moment().toDate(),
	type: "cleanOldMessages",
	intervalTimer: 24 * 60 * 60 * 1000,
	inform: true,
});

new scheduler.Interval({
	source: async () => {
		const users = await DB.user.models.user.distinct(`id`);
		for (const chunk of utils.array.splitTo(users, 100)) {
			const chunkInfo = await VK.user.getVK().api.users.get({
				user_ids: chunk,
				fields: UsersGetFields,
			});
			for (const userId of chunkInfo) {
				const user = await DB.user.models.user.findOne({ id: userId });
				
			}
		}
	},
	plannedTime: moment().toDate(),
	intervalTimer: 4 * 60 * 60 * 1000,
	inform: true,
	type: "updateUsersData",
});

scheduler.events.on("executions", (execution) => {
	InternalUtils.logger.send(
		`Выполнена запланированная задача:
Время выполнения: ${execution.executionTime}ms
Тип: ${execution.task.type}
Следующее выполнение: ${moment(execution.task.nextExecute).format(
			"DD.MM.YYYY, HH:mm:ss",
		)}
${
	typeof execution.response === "string" ? "Ответ: " + execution.response : ""
}`,
		"info",
	);
});

scheduler.events.on("errors", (error) => {
	InternalUtils.logger.send(
		`Ошибки при выполнении запланированной задача:
Время выполнения: ${error.executionTime}ms
Тип: ${error.task.type}
Следующее выполнение: ${moment(error.task.nextExecute).format(
			"DD.MM.YYYY, HH:mm:ss",
		)}
Ошибка: ${error.error.toString()}`,
		"info",
	);
});

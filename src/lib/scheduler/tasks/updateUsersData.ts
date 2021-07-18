import utils from "rus-anonym-utils";
import { Interval } from "simple-scheduler-task";

import { UsersFields } from "vk-io/lib/api/schemas/objects";

import InternalUtils from "../../utils/core";
import DB from "../../DB/core";
import VK from "../../VK/core";

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

async function updateUsersData(): Promise<string | null> {
	const users = await DB.user.models.user.distinct(`id`);
	const output: string[] = [];
	for (const chunk of utils.array.splitTo(users, 250)) {
		const chunkInfo = await VK.user.getVK().api.users.get({
			user_ids: chunk,
			fields: UsersGetFields,
		});
		for (const userInfo of chunkInfo) {
			const user = await DB.user.models.user.findOne({ id: userInfo.id });
			if (!user || user.info.isBot) {
				break;
			}
			if (user.info.isTrack) {
				InternalUtils.user.updateTrackUserData(user.id, userInfo);
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
			if (user.info.extends.domain !== userInfo.domain) {
				output.push(
					`Ссылка изменена: ${user.info.extends.domain} => ${userInfo.domain}`,
				);
				if (user.info.extends.domain !== `id${userInfo.id}`) {
					try {
						await InternalUtils.user.reserveScreenName(
							user.info.extends.domain,
						);
						output.push(
							`Удачная попытка резервирования @${user.info.extends.domain}`,
						);
					} catch (error) {
						output.push(`Неудачная попытка резервирования домена`);
					}
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
	type: "updateUsersData",
	source: updateUsersData,
	plannedTime: Date.now(),
	cron: "*/30 * * * *",
	onDone: (log) => {
		if (log.response) {
			InternalUtils.logger.send({ message: `${log.response}`, type: "info" });
		}
	},
});

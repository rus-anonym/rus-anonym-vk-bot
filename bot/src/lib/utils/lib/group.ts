import utils from "rus-anonym-utils";
import { Keyboard, getRandomId } from "vk-io";

import { ExtractDoc } from "ts-mongoose";
import { MessagesSendParams } from "vk-io/lib/api/schemas/params";

import VK from "../../VK/core";
import DB from "../../DB/core";

export default class UtilsGroup {
	public async getUserData(
		id: number,
		groupId: number,
	): Promise<ExtractDoc<typeof DB.group.schemes.user>> {
		const userData = await DB.group.models.user.findOne({
			id,
		});
		if (!userData) {
			const [VK_USER_DATA] = await VK.group.getAPI().users.get({
				user_id: id,
				fields: ["status", "last_seen", "sex"],
			});
			const newUserData = new DB.group.models.user({
				id,
				nickname: `User #${id}`,
				regDate: new Date(),
				isMailingAllowed: true,
				regGroupId: groupId,
			});
			await newUserData.save();
			VK.group.getAPI().messages.send({
				peer_id: 2e9 + 6,
				random_id: getRandomId(),
				message: `@id${id} (${VK_USER_DATA.first_name} ${VK_USER_DATA.last_name}) добавлен в БД`,
				disable_mentions: true,
			});
			return newUserData;
		}
		return userData;
	}

	public async mailing(options: MessagesSendParams) {
		const keyboard = Keyboard.builder()
			.textButton({
				label: `Отключить рассылку`,
				payload: {
					cmd: `Рассылка отключить`,
				},
				color: Keyboard.NEGATIVE_COLOR,
			})
			.inline();

		for (const subGroup of VK.subGroups) {
			const mailingUsers = (await DB.group.models.user
				.find({
					regGroupId: subGroup.id,
					isMailingAllowed: true,
				})
				.distinct("id")) as number[];

			for (const peer_ids of utils.array.splitTo(mailingUsers, 100)) {
				const response = (await subGroup.getAPI().messages.send({
					...options,
					peer_ids,
					keyboard,
					random_id: getRandomId(),
				})) as unknown as Array<{
					peer_id: number;
					error?: unknown;
				}>;
				for (const userResponse of response) {
					if (userResponse.error) {
						await DB.group.models.user.updateOne(
							{
								id: userResponse.peer_id,
							},
							{ isMailingAllowed: false },
						);
					}
				}
			}
		}

		const mailingUsers = (await DB.group.models.user
			.find({
				regGroupId: DB.config.VK.group.id,
				isMailingAllowed: true,
			})
			.distinct("id")) as number[];

		for (const peer_ids of utils.array.splitTo(mailingUsers, 100)) {
			const response = (await VK.group.getAPI().messages.send({
				...options,
				peer_ids,
				keyboard,
				random_id: getRandomId(),
			})) as unknown as Array<{
				peer_id: number;
				error?: unknown;
			}>;
			for (const userResponse of response) {
				if (userResponse.error) {
					await DB.group.models.user.updateOne(
						{
							id: userResponse.peer_id,
						},
						{ isMailingAllowed: false },
					);
				}
			}
		}
	}
}

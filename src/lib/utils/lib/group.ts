import { ExtractDoc } from "ts-mongoose";
import { getRandomId } from "vk-io";

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
}

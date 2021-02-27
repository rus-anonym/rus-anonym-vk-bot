import * as utils from "rus-anonym-utils";
import DataBase from "./DB/core";
import { getRandomId } from "vk-io";
import { group } from "./VK/core";

export async function logError(error: Error): Promise<void> {
	group
		.getVK()
		.upload.messageDocument({
			peer_id: 2e9 + DataBase.config.vk.group.conversations.errors,
			source: {
				value: Buffer.from(`Error on ${utils.time.currentDateTime()}
Error: ${error.toString()}

Stack: ${error.stack}`),
				filename: "Error.txt",
			},
		})
		.then(async (res) => {
			return await group.getVK().api.messages.send({
				message: `@id${DataBase.config.vk.user.id}`,
				attachment: res.toString(),
				random_id: getRandomId(),
				chat_id: DataBase.config.vk.group.conversations.errors,
			});
		});
}

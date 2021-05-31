import { resolveResource } from "vk-io";
import { Command } from "../../../utils/lib/command";

new Command(/(?:^!reserve)(?:\s(.*))$/i, async function (message, vk) {
	try {
		await resolveResource({ resource: message.args[1] });
		return message.editMessage({
			message: `@${message.args[1]} уже занят`,
		});
	} catch (error) {
		const newGroup = await vk.api.groups.create({
			title: `Reserve ScreenName ${message.args[1]}`,
		});

		await vk.api.groups.edit({
			group_id: newGroup.id,
			screen_name: message.args[1],
			access: 2,
		});

		return message.editMessage({
			message: `@${message.args[1]} зарезервирован`,
		});
	}
});

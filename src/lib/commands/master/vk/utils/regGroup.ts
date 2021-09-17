import { UserCommand } from "../../../../utils/lib/commands/core";
import VK from "../../../../VK/core";

new UserCommand({
	regexp: /(?:^!regGroup)(?:\s(.*))?$/i,
	process: async function (message) {
		await message.loadMessagePayload();
		const groupName = message.state.args[1] || "Reserve group";
		const newGroup = await VK.slave.getAPI().groups.create({
			title: groupName,
		});
		await VK.slave.getAPI().groups.edit({
			group_id: newGroup.id,
			access: 2,
		});
		return message.reply(`Зарегистрирована группа @club${newGroup.id}`);
	},
});

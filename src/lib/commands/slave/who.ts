import utils from "rus-anonym-utils";
import { SlaveCommand } from "../../utils/lib/commands/core";
import VK from "../../VK/core";

new SlaveCommand({
	regexp: /(?:^раб кто)(?:\s(.*))$/i,
	process: async function (context) {
		if (!context.isChat) {
			return;
		}

		const chatMembers = (
			await VK.slave.getAPI().messages.getConversationMembers({
				peer_id: context.peerId,
			})
		).items.filter((x) => x.member_id > 0);

		const randomMember = utils.array.random(chatMembers);

		const [memberInfo] = await VK.group.getAPI().users.get({
			user_ids: randomMember.member_id.toString(),
		});

		const { id, first_name: name, last_name: surname } = memberInfo;

		return context.reply(
			`Мне кажется что ${context.state.args[1].replace(
				/\?/g,
				"",
			)} это @id${id} (${name} ${surname})`,
			{
				disable_mentions: true,
			},
		);
	},
});

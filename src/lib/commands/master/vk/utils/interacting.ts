import { UserCommand } from "../../../../utils/lib/commands/core";

import InternalUtils from "../../../../utils/core";
import VK from "../../../../VK/core";
import DB from "../../../../DB/core";
import { MessageContext } from "vk-io";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";

const getUsersData = async (
	message: MessageContext,
): Promise<{ sender: UsersUserFull; target: UsersUserFull }> => {
	const userID = await InternalUtils.userCommands.getUserId(
		message,
		message.state.args[1],
	);

	const [senderInfo, targetInfo] = await VK.group.getAPI().users.get({
		user_ids: [DB.config.VK.user.master.id.toString(), userID.toString()],
		fields: ["sex", "first_name_acc", "last_name_acc"],
	});

	return {
		sender: senderInfo,
		target: targetInfo || senderInfo,
	};
};

const templates: {
	trigger: string;
	male: string;
	female: string;
	smiley?: string;
}[] = [
	{
		trigger: "обнять",
		male: "обнял",
		female: "обняла",
		smiley: "🤗",
	},
	{
		trigger: "поцеловать",
		male: "поцеловал",
		female: "поцеловала",
		smiley: "💋",
	},
];

templates.map((template) => {
	new UserCommand(
		{
			regexp: new RegExp(`(?:^${template.trigger})(?:\\s(.*))?$`, "i"), process:
				async function (message) {
					try {
						await message.loadMessagePayload();
						const { sender, target } = await getUsersData(message);
						await message.deleteMessage({ delete_for_all: true });
						return await message.send({
							message: `${template.smiley + " " || ""}@id${sender.id} (${sender.first_name} ${sender.last_name}) ${sender.sex === 1 ? template.female : template.male} @id${target.id} (${target.first_name_acc} ${target.last_name_acc})`,
							disable_mentions: true,
							reply_to: message.replyMessage?.id || undefined,
							attachment: message.attachments.map((x) => x.toString()),
						});
					} catch (error) {
						return await message.editMessage({
							message: error.message,
						});
					}
				}
		},
	);
});

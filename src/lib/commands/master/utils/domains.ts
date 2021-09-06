import { UserCommand } from "../../../utils/lib/commands/core";

import DB from "../../../DB/core";

new UserCommand(/(?:^!domains)$/i, async function (message, vk) {
	const reserveGroupsCount = await DB.main.models.reserveGroup.countDocuments();
	const reservedDomains = await DB.main.models.reserveGroup.find({
		isReserve: true,
	});
	return message.editMessage({
		message: `Total: ${reserveGroupsCount}
Reserved: ${reservedDomains.length}
Free groups for reseve: ${reserveGroupsCount - reservedDomains.length}`,
		attachment: (
			await vk.upload.messageDocument({
				source: {
					value: Buffer.from(
						reservedDomains
							.map((x, index) => `${+index + 1}. ${x.domain}`)
							.join("\n"),
						"utf-8",
					),
					filename: "domains.txt",
				},
				peer_id: message.peerId,
			})
		).toString(),
	});
});

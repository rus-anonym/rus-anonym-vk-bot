// import { UserCommand } from "../../../utils/lib/commands/core";

// import DB from "../../../DB/core";

// new UserCommand(/(?:^!sync)$/i, async function (message) {
// 	let log = `User DB Log:\n`;
// 	const userDBUsers = await DB.user.models.user.updateMany(
// 		{
// 			"info.full": {
// 				$exists: true,
// 			},
// 			"info.full.settings": {
// 				$exists: false,
// 			},
// 		},
// 		{
// 			"info.full.settings": {},
// 			"info.full.settings.getAudios": true,
// 		},
// 	);
// 	log += `Users updated:
// Matched: ${userDBUsers.n}
// Modified: ${userDBUsers.nModified}\n`;
// 	await message.editMessage({
// 		message: log,
// 	});
// });

import utils from "rus-anonym-utils";
import { getRandomId } from "vk-io";

import { UserCommand } from "../../../utils/lib/commands/core";

const images = [
	`photo266982306_457333385_00b97eb0a7f775e994`,
	`photo266982306_457333386_6b627fa5f329d88150`,
	`photo266982306_457333387_924cf6a4d29b12f95e`,
	`photo266982306_457333388_2e3899760159dca6df`,
	`photo266982306_457333389_9f7b0ca19de4e9c57d`,
	`photo266982306_457333390_6de695f7c8339f6dee`,
	`photo266982306_457333391_224f023f77f31b020e`,
	`photo266982306_457333392_327bc61b3689805dbc`,
	`photo266982306_457333393_a662e7c3e3a703947e`,
	`photo266982306_457333394_09236bf56588893bdb`,
	`photo266982306_457333395_2746468078cf2fbe69`,
	`photo266982306_457333396_8266904f9141df5f2c`,
	`photo266982306_457333397_03f7184d564ebefb5e`,
	`photo266982306_457333398_ef1d85fde79a9ce2d3`,
	`photo266982306_457333399_34a8bce7a31a548861`,
	`photo266982306_457333400_d6ce7a7e0c1a825aec`,
	`photo266982306_457333401_7a943a92eed8c7bc76`,
	`photo266982306_457333402_8ed88ca8c610b37dd0`,
];

new UserCommand(/(?:^похуй)(?:\s(\d+))?$/i, async function (message) {
	message.state.args[1] = message.state.args[1] || "2";
	const selectedNumber = Number(message.state.args[1]);
	const count = selectedNumber > images.length ? images.length : selectedNumber;
	const selectedAttachments = [];
	for (let i = 0; i < count; ++i) {
		selectedAttachments.push(images[i]);
	}
	for (const chunk of utils.array.splitTo(selectedAttachments, 10)) {
		await message.send({
			random_id: getRandomId(),
			attachment: chunk,
		});
	}
});

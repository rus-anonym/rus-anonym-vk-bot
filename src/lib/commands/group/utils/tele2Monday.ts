import moment from "moment";
import axios from "axios";
import cheerio from "cheerio";

import { GroupCommand } from "./../../../utils/lib/commands/core";

new GroupCommand(/(?:^подарки теле2)$/i, async function (message) {
	const tele2Monday = await (
		await axios.get("https://mskponedelniki.tele2.ru/")
	).data;

	const $ = cheerio.load(tele2Monday);
	const mondayGiftsHTML = $(
		"body > div.page > div.main-content > div.mobile-box.monday-gifts-box.monday-gifts-box--black > div:nth-child(1) > div.monday-gifts-box__slider.slider",
	);

	const mondayGifts: string[] = [];

	$($(mondayGiftsHTML.children()[0]).children()[0])
		.children()
		.each((_index, element) => {
			const gift = $(element);
			mondayGifts.push(gift.text().trim());
		});

	let text = ``;

	for (let i = 0; i < mondayGifts.length; i++) {
		text += `${Number(i) + 1}. ${mondayGifts[i]}\n`;
	}

	return message.state.sendMessage({
		message: `На ${moment().format("DD.MM.YYYY")} следующие подарки:
${text}`,
	});
});

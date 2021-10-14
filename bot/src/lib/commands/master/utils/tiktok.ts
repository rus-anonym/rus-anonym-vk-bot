import puppeteer from "puppeteer";
import cheerio from "cheerio";

import { UserCommand } from "../../../utils/lib/commands/core";

new UserCommand({
	regexp: /(?:^!tiktok|!тикток)(\s(.*))$/i,
	process: async function (context, vk) {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto("https://musicaldown.com/");
		await page.type("#link_url", context.state.args[1]);
		await page.click("#submit-form > div > div:nth-child(2) > button");
		await page.waitForTimeout(5000);
		const bodyHandler = await page.$("body");
		const html = await page.evaluate((body) => body.innerHTML, bodyHandler);
		await bodyHandler!.dispose();
		const $ = cheerio.load(html);
		const directLink = $(
			"body > div.welcome.section > div > div:nth-child(2) > div.col.s12.l8 > a:nth-child(8)",
		).attr("href");
		await browser.close();
		if (!directLink) {
			throw new Error(`Непредвиденная ошибка, повторите запрос.`);
		}

		const message = `TikTok video:
Video URL: ${directLink}`;

		const userResponse = await context.reply({
			message,
			dont_parse_links: true,
		});

		const attachment = await vk.upload.video({
			source: {
				value: directLink,
			},
			name: "TikTok Video",
			is_private: 1,
			compression: 0,
			repeat: 1,
		});

		return await vk.api.messages.edit({
			peer_id: context.peerId,
			message_id: userResponse.id,
			message,
			attachment: attachment.toString(),
		});
	},
});

new UserCommand({
	regexp: /^(https:\/\/(vm|www).tiktok.com\/(?:.*))/,
	process: async function (context, vk) {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto("https://musicaldown.com/");
		await page.type("#link_url", context.state.args[1]);
		await page.click("#submit-form > div > div:nth-child(2) > button");
		await page.waitForTimeout(5000);
		const bodyHandler = await page.$("body");
		const html = await page.evaluate((body) => body.innerHTML, bodyHandler);
		await bodyHandler!.dispose();
		const $ = cheerio.load(html);
		const directLink = $(
			"body > div.welcome.section > div > div:nth-child(2) > div.col.s12.l8 > a:nth-child(8)",
		).attr("href");
		await browser.close();
		if (!directLink) {
			throw new Error(`Непредвиденная ошибка, повторите запрос.`);
		}

		const attachment = await vk.upload.video({
			source: {
				value: directLink,
			},
			name: "TikTok Video",
			is_private: 1,
			compression: 0,
			repeat: 1,
		});

		await context.editMessage({
			attachment: attachment.toString(),
			message: "&#13;" + context.text,
			dont_parse_links: true,
		});
	},
});

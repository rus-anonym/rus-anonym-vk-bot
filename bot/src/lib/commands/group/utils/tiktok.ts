import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { Keyboard } from "vk-io";

import { GroupCommand } from "../../../utils/lib/commands/core";
import VK from "../../../VK/core";
import DB from "../../../DB/core";

new GroupCommand({
	regexp: /(?:^\/tiktok)(\s(.*))$/i,
	process: async function (context) {
		await context.state.sendMessage({
			message: `Обрабатываю видео...`,
		});

		try {
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

			const builder = Keyboard.builder();

			builder.urlButton({
				label: `Скачать видео`,
				url: directLink,
			});

			builder.inline();

			const userResponse = await context.state.sendMessage({
				message: `TikTok video:`,
				dont_parse_links: true,
				keyboard: builder,
				content_source: JSON.stringify({
					type: "message",
					owner_id: context.senderId,
					peer_id: context.peerId,
					conversation_message_id: context.conversationMessageId,
				}),
			});

			const attachment = await VK.slave.main.upload.video({
				source: {
					value: directLink,
				},
				group_id: DB.config.VK.group.id,
				name: "TikTok Video",
				is_private: 1,
				compression: 0,
				repeat: 1,
			});

			return await VK.group.getAPI().messages.edit({
				peer_id: context.peerId,
				conversation_message_id: userResponse.conversationMessageId,
				message: "",
				attachment: attachment.toString(),
				keyboard: builder,
				content_source: JSON.stringify({
					type: "message",
					owner_id: context.senderId,
					peer_id: context.peerId,
					conversation_message_id: context.conversationMessageId,
				}),
			});
		} catch (error) {
			return await context.state.sendMessage({
				message: `Ошибка: ${error.toString()}`,
				dont_parse_links: true,
			});
		}
	},
});

import moment from "moment";
import utils from "rus-anonym-utils";
import { Command } from "../../../utils/lib/command";

new Command(/^(?:!article|!статья)(?:\s(.*))$/i, async function (message) {
	try {
		const article = await utils.vk.article.getByURL(message.args[1].trim());

		return await message.editMessage({
			message: `Данные по статье #${article.id}
Владелец: @${article.owner_id < 1 ? "club" : "id"}${article.owner_id}
Название: ${article.title} 

Attachment: article${article.owner_id}_${article.id}_${article.access_hash}

${article.shares_formatted}
${article.views_formatted}

Опубликовано: ${moment(article.published).format("DD.MM.YYYY в hh:mm:SS")}`,
			disable_mentions: true,
		});
	} catch (error) {
		return message.reply("Неверная ссылка");
	}
});

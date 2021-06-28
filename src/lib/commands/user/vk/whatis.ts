/* eslint-disable @typescript-eslint/no-non-null-assertion */

import moment from "moment";
import utils from "rus-anonym-utils";
import { MessageContext } from "vk-io";

import VK from "../../../VK/core";
import InternalUtils from "../../../utils/core";
import { Command } from "../../../utils/lib/command";
import { StoreGetProductsResponse } from "vk-io/lib/api/schemas/responses";

const bytesToSize = (bytes: number): string => {
	if (bytes === 0) {
		return "0 Bytes";
	}
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
};

const AttachmentsToString = async (
	message: MessageContext,
): Promise<string> => {
	let text = ``;
	let i = 0;
	for (const audio of message.getAttachments(`audio`)) {
		++i;
		await audio.loadAttachmentPayload();
		text += `${i}. audio
Название: ${audio.title}
Исполнитель: ${audio.artist}
Продолжительность: ${utils.time.precizeDiff(
			moment().add(audio.duration!, "second"),
			moment(),
		)}
High Quality Audio: ${audio.isHq ? "Да" : "Нет"}
Добавлен: ${moment(audio.createdAt! * 1000).format("DD.MM.YYYY, HH:mm:ss")}
String: ${audio.toString()}\n`;
	}
	for (const audioMessage of message.getAttachments("audio_message")) {
		await audioMessage.loadAttachmentPayload();
		text += `${i}. audio_message
URL: ${audioMessage.url}
Продолжительность: ${utils.time.precizeDiff(
			moment().add(audioMessage.duration!, "second"),
			moment(),
		)}
String: ${audioMessage.toString()}\n`;
	}
	for (const doc of message.getAttachments(`doc`)) {
		++i;
		await doc.loadAttachmentPayload();
		text += `${i}. doc
Название: ${doc.title}
Расширение: ${doc.extension}
Размер: ${bytesToSize(doc.size!)}
URL: ${doc.url}
Добавлен: ${moment(doc.createdAt! * 1000).format("DD.MM.YYYY, HH:mm:ss")}
Тип: ${
			[
				`Текстовый документ`,
				`Архив`,
				`GIF`,
				`Изображение`,
				`Аудиозапись`,
				`Видеозапись`,
				`Электронная книга`,
				`Неизвестный`,
			][doc.typeId! - 1]
		}
String: ${doc.toString()}\n`;
	}
	for (const gift of message.getAttachments(`gift`)) {
		++i;
		text += `${i}. gift
ID: ${gift.id}`;
	}
	for (const graffiti of message.getAttachments(`graffiti`)) {
		++i;
		await graffiti.loadAttachmentPayload();
		text += `${i}. graffiti
Владелец: @${graffiti.ownerId < 0 ? "club" : "id"}${graffiti.ownerId}
Разрешение: ${graffiti.width}x${graffiti.height}
String: ${graffiti.toString()}\n`;
	}
	for (const link of message.getAttachments(`link`)) {
		++i;
		text += `${i}. link
Title: ${link.title}`;
	}
	for (const market of message.getAttachments(`market`)) {
		++i;
		await market.loadAttachmentPayload();
		text += `${i}. market`;
	}
	for (const market_album of message.getAttachments(`market_album`)) {
		++i;
		await market_album.loadAttachmentPayload();
		text += `${i}. market_album`;
	}
	for (const photo of message.getAttachments(`photo`)) {
		++i;
		await photo.loadAttachmentPayload();
		const maxResolution = photo.sizes!.sort(
			(
				a: { width: number; height: number },
				b: { width: number; height: number },
			) => {
				if (a.width > b.width || a.height > b.height) {
					return -1;
				} else if (a.width < b.width || a.height < b.height) {
					return 1;
				} else {
					return 0;
				}
			},
		)[0];
		text += `${i}. photo
Владелец: @${photo.ownerId! < 0 ? "club" : "id"}${photo.ownerId}
Разрешение: ${maxResolution.width}x${maxResolution.height}
Добавлено: ${moment(photo.createdAt! * 1000).format("DD.MM.YYYY, HH:mm:ss")}
String: ${photo.toString()}`;
	}
	for (const poll of message.getAttachments(`poll`)) {
		++i;
		await poll.loadAttachmentPayload();
		text += `${i}. poll
${
	poll.authorId
		? `Создатель: @${poll.authorId < 0 ? "club" : "id"}${poll.authorId}\n`
		: ""
}Голосов: ${utils.number.separator(poll.votes!, ".")}
Создан: ${moment(poll.createdAt! * 1000).format("DD.MM.YYYY, HH:mm:ss")}
${
	poll.endedAt! > 0
		? `Завершится через ${utils.time.precizeDiff(
				moment(),
				moment(poll.endedAt! * 1000),
		  )}`
		: ""
}`;
	}
	for (const sticker of message.getAttachments(`sticker`)) {
		++i;
		const [userStickerPackInfo] = (
			(await VK.user.getVK().api.store.getProducts({
				product_ids: [sticker.productId],
				type: "stickers",
				user_id: message.senderId,
			})) as any
		).items as StoreGetProductsResponse;
		const [stickerPackInfo] = await utils.vk.user.getStickersInfo(
			VK.user.getVK().api.options.token,
			[sticker.productId],
		);
		text += `${i}. sticker 	
ID: ${sticker.id}
Pack ID: ${sticker.productId} 
Название: ${stickerPackInfo.name}
Автор: ${stickerPackInfo.author}
Описание: ${stickerPackInfo.description}${
			stickerPackInfo.isFree ? "" : `\nЦена в голосах: ${stickerPackInfo.price}`
		}
Это ${stickerPackInfo.isFree ? "бесплатный" : "платный"} пак
${stickerPackInfo.isFree ? "Добавлен" : "Куплен"} пользователем: ${moment(
			userStickerPackInfo.purchase_date! * 1000,
		).format("DD.MM.YYYY, HH:mm:ss")}\n`;
	}
	return text;
};

new Command(/(?:^!whatis)$/i, async function (message) {
	await message.loadMessagePayload();

	if (message.forwards[0] && message.forwards[0].hasAttachments()) {
		return message.reply({
			disable_mentions: true,
			message: `
Прикрепления:
${await AttachmentsToString(message.forwards[0])}`,
		});
	}

	if (message.replyMessage?.hasAttachments()) {
		return message.reply({
			disable_mentions: true,
			message: `
Прикрепления:
${await AttachmentsToString(message.replyMessage)}`,
		});
	}

	if (message.hasAttachments()) {
		return message.reply({
			disable_mentions: true,
			message: `
Прикрепления:
${await AttachmentsToString(message)}`,
		});
	}

	return message.editMessage({
		disable_mentions: true,
		message: `Не нашёл прикреплений`,
	});
});

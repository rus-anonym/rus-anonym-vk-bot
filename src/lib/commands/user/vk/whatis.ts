/* eslint-disable @typescript-eslint/no-non-null-assertion */

import moment from "moment";
import utils from "rus-anonym-utils";
import { MessageContext } from "vk-io";

import { Command } from "../../../utils/lib/command";

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
		}`;
	}
	for (const sticker of message.getAttachments(`sticker`)) {
		++i;
		text += `${i}. sticker 
ID: ${sticker.id}
Pack ID: ${sticker.productId}\n`;
	}
	return text;
};

new Command(/(?:^!whatis)$/i, async function (message) {
	await message.loadMessagePayload();

	if (message.forwards[0] && message.forwards[0].hasAttachments()) {
		return message.editMessage({
			message: `
Прикрепления:
${await AttachmentsToString(message.forwards[0])}`,
		});
	}

	if (message.replyMessage?.hasAttachments()) {
		return message.editMessage({
			message: `
Прикрепления:
${await AttachmentsToString(message.replyMessage)}`,
		});
	}

	if (message.hasAttachments()) {
		return message.editMessage({
			message: `
Прикрепления:
${await AttachmentsToString(message)}`,
		});
	}

	return message.editMessage({
		message: `Не нашёл прикреплений`,
	});
});

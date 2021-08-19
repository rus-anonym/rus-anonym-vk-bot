/* eslint-disable @typescript-eslint/no-non-null-assertion */

import moment from "moment";
import utils from "rus-anonym-utils";
import { resolveResource, MessageContext } from "vk-io";
import { StoreGetProductsResponse } from "vk-io/lib/api/schemas/responses";

import { UtilsCommands, UserCommand } from "../core";
import InternalUtils from "../../../core";
import VK from "../../../../VK/core";
import {
	MessagesMessageAttachment,
	MessagesMessageAttachmentType,
} from "vk-io/lib/api/schemas/objects";

export default class UtilsUserCommands extends UtilsCommands {
	public list: UserCommand[] = [];

	public addCommand(command: UserCommand): void {
		this.list.push(command);
	}

	public findCommand(input: string): UserCommand | undefined {
		return this.list.find((x) => x.check(input));
	}

	public async getUserId(message: MessageContext): Promise<number> {
		if (message.forwards[0]) {
			return message.forwards[0].senderId;
		} else if (message.replyMessage) {
			return message.replyMessage.senderId;
		} else if (message.state.args[1]) {
			try {
				const linkData = await resolveResource({
					resource: message.state.args[1],
					api: VK.group.getVK().api,
				});
				if (linkData.type === "group") {
					return -linkData.id;
				} else if (linkData.type === "user") {
					return linkData.id;
				} else {
					throw new Error("Не смог распознать ссылку");
				}
			} catch (error) {
				throw new Error("Не смог распознать ссылку");
			}
		} else if (!message.isChat) {
			return message.peerId;
		} else {
			throw new Error("Не смог распознать ссылку");
		}
	}
	public async attachmentsToString(
		attachments: MessagesMessageAttachment[],
		user_id: number,
	): Promise<string> {
		let text = ``;
		let i = 0;

		for (const attachment of attachments) {
			switch (attachment.type as MessagesMessageAttachmentType | string) {
				case "article":
					{
						++i;
						const article = attachment.article;
						text += `${i}. Статья:
Просмотров: ${article.views}
Поделилось: ${article.shares}
Опубликована: ${moment(article.published_date * 1000).format(
							"DD.MM.YYYY, HH:mm:ss",
						)}
String: article${article.owner_id}_${article.id}_${article.access_key}\n\n`;
					}
					break;
				case "audio": {
					++i;
					const audio = attachment.audio;
					console.log(audio);
					text += `${i}. Аудиозапись:
Исполнитель: ${audio.artist}
Название: ${audio.title}
Альбом: https://vk.com/music/album/${audio.album.owner_id}_${audio.album.id}_${
						audio.album.access_key
					}
Исполнители: [\n${
						audio.main_artists
							? audio.main_artists
									.map((x: { name: string; id: string }) => {
										return `${x.name}: https://vk.com/artist/${x.id}`;
									})
									.join("\n")
							: ""
					}\n]
Соисполнители: [\n${
						audio.featured_artists
							? audio.featured_artists
									.map((x: { name: string; id: string }) => {
										return `${x.name}: https://vk.com/artist/${x.id}`;
									})
									.join("\n")
							: ""
					}\n]
Продолжительность: ${utils.time.precizeDiff(
						moment().add(audio.duration, "second"),
						moment(),
					)}
URL: ${InternalUtils.commands.parseAudioURL(audio.url)}
String: audio${audio.owner_id}_${audio.id}_${audio.access_key}\n\n`;
					break;
				}
				case "audio_message": {
					++i;
					const audioMessage = attachment.audio_message;
					text += `${i}. Голосовое сообщение:
OGG: ${audioMessage.link_ogg}
MP3: ${audioMessage.link_mp3}
Продолжительность: ${utils.time.precizeDiff(
						moment().add(audioMessage.duration, "second"),
						moment(),
					)}
String: audio_message${audioMessage.owner_id}_${audioMessage.id}_${
						audioMessage.access_key
					}\n\n`;
					break;
				}
				case "doc": {
					++i;
					const doc = attachment.doc;
					text += `${i}. Документ:
Название: ${doc.title}
Расширение: ${doc.ext}
URL: ${await InternalUtils.commands.getDocumentSource(doc.url)}
Добавлен: ${moment(doc.date * 1000).format("DD.MM.YYYY, HH:mm:ss")}
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
						][doc.type - 1]
					}
String: doc${doc.owner_id}_${doc.id}_${doc.access_key}\n\n`;
					break;
				}
				case "graffiti": {
					++i;
					const graffiti = attachment.graffiti;
					text += `${i}. Граффити:
Высота: ${graffiti.height}px
Ширина: ${graffiti.width}px
URL: ${await InternalUtils.commands.getDocumentSource(graffiti.url)}
String: doc${graffiti.owner_id}_${graffiti.id}_${graffiti.access_key}\n\n`;
					break;
				}
				case "sticker": {
					++i;
					const sticker = attachment.sticker;

					const [userStickerPackInfo] = (
						(await VK.fakes.getUserFakeAPI().store.getProducts({
							product_ids: [sticker.product_id],
							type: "stickers",
							user_id,
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
						})) as any
					).items as StoreGetProductsResponse;

					const [stickerPackInfo] = await utils.vk.user.getStickerPacksInfo(
						VK.user.getVK().api.options.token,
						[sticker.product_id],
					);

					const url = utils.array.last<{
						url: string;
					}>(sticker.images).url;

					const urlWithBackground = utils.array.last<{
						url: string;
					}>(sticker.images_with_background).url;

					const stickerSuggestions = await VK.fakes
						.getUserFakeAPI()
						.call("store.getStickerSuggestions", {
							sticker_id: sticker.sticker_id,
						});

					text += `${i}. Стикер:
ID: ${sticker.sticker_id}
Pack ID: ${sticker.product_id} 
Название: ${stickerPackInfo.title}
Автор: ${stickerPackInfo.author}
Описание: ${stickerPackInfo.description}${
						stickerPackInfo.isFree
							? ""
							: `\nЦена в голосах: ${stickerPackInfo.price}\nЦена в рублях: ${
									stickerPackInfo.price * 7
							  }₽`
					}
Ссылка: ${stickerPackInfo.url}
Copyright: ${stickerPackInfo.copyright}
URL без фона: ${url}
URL с фоном: ${urlWithBackground}
Это ${stickerPackInfo.isFree ? "бесплатный" : "платный"} ${
						stickerPackInfo.isAnimation ? "анимированный" : "обычный"
					} ${stickerPackInfo.isStyle ? "стиль" : "стикерпак"}
${stickerPackInfo.isFree ? "Добавлен" : "Куплен"} пользователем: ${moment(
						userStickerPackInfo.purchase_date! * 1000,
					).format("DD.MM.YYYY, HH:mm:ss")}\n
Подсказки: ${stickerSuggestions.suggestions
						.filter((x: { is_user: boolean }) => !x.is_user)
						.map((x: { word: string }) => x.word)
						.join(", ")}`;
					break;
				}
				case "audio_playlist": {
					i++;
					const audioPlaylist = attachment.audio_playlist;
					text += `${i}. Плейлист
Создатель: https://vk.com/${audioPlaylist.owner_id < 0 ? "club" : "id"}${
						audioPlaylist.owner_id
					}
Треков: ${audioPlaylist.count}
Подписчиков: ${audioPlaylist.followers}
Проигрываний: ${audioPlaylist.plays}
Создан: ${moment(audioPlaylist.create_time * 1000).format(
						"DD.MM.YYYY, HH:mm:ss",
					)}
Обновлён: ${moment(audioPlaylist.update_time * 1000).format(
						"DD.MM.YYYY, HH:mm:ss",
					)}
URL: https://vk.com/music/playlist/${audioPlaylist.owner_id}_${
						audioPlaylist.id
					}_${audioPlaylist.access_key}
String: audio_playlist${audioPlaylist.owner_id}_${audioPlaylist.id}_${
						audioPlaylist.access_key
					}\n\n`;
					break;
				}
				case "photo": {
					++i;
					const photo = attachment.photo;
					photo.sizes.sort(
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
					);
					text += `${i}. Фотография
Максимальное разрешение: ${photo.sizes[0].width}x${photo.sizes[0].height}
URL: ${photo.sizes[0].url}
String: photo${photo.owner_id}_${photo.id}_${photo.access_key}\n\n`;
					break;
				}

				default:
					break;
			}
		}

		return text;
	}
}

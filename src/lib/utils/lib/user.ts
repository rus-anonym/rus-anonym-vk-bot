/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment from "moment";
import utils from "rus-anonym-utils";
import {
	ContextDefaultState,
	getRandomId,
	MessageContext,
	MessageFlagsContext,
	createCollectIterator,
	resolveResource,
	ResourceError,
} from "vk-io";
import { ExtractDoc } from "ts-mongoose";

import VK from "../../VK/core";
import InternalUtils from "../core";
import DB from "../../DB/core";
import {
	FriendsUserXtrLists,
	UsersFields,
	UsersUserFull,
} from "vk-io/lib/api/schemas/objects";

interface BirthdayUser {
	name: string;
	surname: string;
	id: number;
}

const UsersGetFields: UsersFields[] = [
	"first_name_nom",
	"first_name_gen",
	"first_name_dat",
	"first_name_acc",
	"first_name_ins",
	"first_name_abl",
	"last_name_nom",
	"last_name_gen",
	"last_name_dat",
	"last_name_acc",
	"last_name_ins",
	"last_name_abl",
	"photo_id",
	"verified",
	"sex",
	"bdate",
	"city",
	"country",
	"home_town",
	"has_photo",
	"photo_50",
	"photo_100",
	"photo_200_orig",
	"photo_200",
	"photo_400",
	"photo_400_orig",
	"photo_max",
	"photo_max_orig",
	"photo_max_size",
	"online",
	"lists",
	"domain",
	"has_mobile",
	"contacts",
	"site",
	"education",
	"universities",
	"schools",
	"status",
	"last_seen",
	"followers_count",
	"counters",
	"common_count",
	"occupation",
	"nickname",
	"relatives",
	"relation",
	"personal",
	"connections",
	"exports",
	"wall_comments",
	"activities",
	"interests",
	"music",
	"movies",
	"tv",
	"books",
	"games",
	"about",
	"quotes",
	"can_post",
	"can_see_all_posts",
	"can_see_audio",
	"can_write_private_message",
	"can_send_friend_request",
	"is_favorite",
	"is_hidden_from_feed",
	"timezone",
	"screen_name",
	"maiden_name",
	"crop_photo",
	"is_friend",
	"friend_status",
	"career",
	"military",
	"blacklisted",
	"blacklisted_by_me",
	"can_subscribe_posts",
	"descriptions",
	"trending",
	"mutual",
	"friendship_weeks",
	"can_invite_to_chats",
	"stories_archive_count",
	"video_live_level",
	"video_live_count",
	"clips_count",
	"service_description",
	"is_dead",
];

export default class UtilsUser {
	public async processDeletedMessage(
		event: MessageFlagsContext<ContextDefaultState>,
	 ): Promise<void> {
		if (event.peerId !== DB.config.VK.user.id) {
			await VK.user.getVK().api.messages.restore({
				message_id: event.id,
			});
			await VK.user.getVK().api.messages.delete({
				message_ids: event.id,
				delete_for_all: true,
			});
		}
	}

	public async processDeletedForAllMessage(
		event: MessageFlagsContext<ContextDefaultState>,
	): Promise<void> {
		const deletedMessageData = await DB.user.models.message.findOne({
			id: event.id,
		});

		if (!deletedMessageData) {
			InternalUtils.logger.send(
				`Удалено сообщение #${event.id}, но в БД нет данных об этом сообщении(`,
				"error",
			);
			return;
		}

		if (deletedMessageData.isOutbox) {
			return;
		}

		const deletedMessageText =
			deletedMessageData.data[deletedMessageData.data.length - 1].text;

		const logsChatId =
			deletedMessageData.peerType === "chat"
				? DB.config.VK.group.logs.conversations.conversations
				: DB.config.VK.group.logs.conversations.messages;

		const uploadedAttachments = await this.uploadAttachments(
			deletedMessageData.data[deletedMessageData.data.length - 1].attachments,
			logsChatId,
		);

		let attachmentsText = "";

		for (let i = 0; i < uploadedAttachments.length; i++) {
			attachmentsText += `\n${Number(i) + 1}. ${uploadedAttachments[i].type}`;
		}

		if (deletedMessageData.senderId > 1) {
			const userData = await this.getUserData(deletedMessageData.senderId);

			VK.group.getVK().api.messages.send({
				message: `Удалено сообщение #id${event.id} от ${moment(
					deletedMessageData.created,
				).format("HH:mm:ss, DD.MM.YYYY")}
Отправитель: @id${deletedMessageData.senderId} (${userData.info.name} ${
					userData.info.surname
				})
#from_id${deletedMessageData.senderId}

Текст сообщения: ${deletedMessageText || "Отсутствует"}

Прикрепления: ${attachmentsText || "Отсутствуют"}`,
				chat_id: logsChatId,
				random_id: getRandomId(),
				attachment: uploadedAttachments.map((x) => x.link),
			});
		} else {
			VK.group.getVK().api.messages.send({
				message: `Удалено сообщение #id${event.id} от ${moment(
					deletedMessageData.created,
				).format("HH:mm:ss, DD.MM.YYYY")}
Отправитель: @club${deletedMessageData.senderId}
#from_id${deletedMessageData.senderId}

Текст сообщения: ${deletedMessageText || "Отсутствует"}

Прикрепления: ${attachmentsText || "Отсутствуют"}`,
				chat_id: logsChatId,
				random_id: getRandomId(),
				attachment: uploadedAttachments.map((x) => x.link),
			});
		}
	}

	public async processEditedMessage(
		message: MessageContext,
		oldMessage: ExtractDoc<typeof DB.user.schemes.message>,
	): Promise<void> {
		const logsChatId =
			oldMessage.peerType === "chat"
				? DB.config.VK.group.logs.conversations.conversations
				: DB.config.VK.group.logs.conversations.messages;
		const uploadedAttachments = await this.uploadAttachments(
			oldMessage.data[oldMessage.data.length - 2].attachments,
			logsChatId,
		);
		let attachmentsText = "";
		uploadedAttachments.map((attachment, index) => {
			attachmentsText += `\n${index + 1}. ${attachment.type}`;
		});

		if (oldMessage.senderId > 0) {
			const userData = await this.getUserData(oldMessage.senderId);

			VK.group.getVK().api.messages.send({
				message: `Отредактировано сообщение #${message.id}
						https://vk.com/im?sel=${
							message.isChat ? `c${message.chatId}` : message.peerId
						}&msgid=${message.id} от ${moment(oldMessage.updated).format(
					"HH:mm:ss, DD.MM.YYYY",
				)}
Отправитель: @id${userData.id} (${userData.info.name} ${userData.info.surname})
						Предыдущие данные:
						Текст: ${oldMessage.data[oldMessage.data.length - 2].text || "Отсутствует"}
												Прикрепления: ${attachmentsText || "Отсутсвуют"}`,
				chat_id: logsChatId,
				random_id: getRandomId(),
				attachment: uploadedAttachments.map((x) => x.link),
			});
		} else {
			VK.group.getVK().api.messages.send({
				message: `Отредактировано сообщение #${message.id}
						https://vk.com/im?sel=${
							message.isChat ? `c${message.chatId}` : message.peerId
						}&msgid=${message.id} от ${moment(oldMessage.updated).format(
					"HH:mm:ss, DD.MM.YYYY",
				)}
Отправитель: @club${-oldMessage.senderId}
						Предыдущие данные:
						Текст: ${oldMessage.data[oldMessage.data.length - 2].text || "Отсутствует"}
												Прикрепления: ${attachmentsText || "Отсутсвуют"}`,
				chat_id: logsChatId,
				random_id: getRandomId(),
				attachment: uploadedAttachments.map((x) => x.link),
			});
		}
	}

	public async saveMessage(message: MessageContext): Promise<void> {
		switch (message.subTypes[0]) {
			case "message_new": {
				await new DB.user.models.message({
					id: message.id,
					conversationMessageId: message.conversationMessageId,
					peerId: message.peerId,
					peerType: message.peerType,
					senderId:
						message.isOutbox === true ? DB.config.VK.user.id : message.senderId,
					senderType: message.senderType,
					created: new Date(message.createdAt * 1000),
					updated: new Date(message.createdAt * 1000),
					isOutbox: message.isOutbox,
					events: [
						{
							updatedAt: message.updatedAt || 0,
							text: message.text || "",
							attachments: message.attachments.map((x) => {
								return x.toString();
							}),
							type: message.type,
							subTypes: message.subTypes || [],
							hasReply: message.hasReplyMessage,
							hasForwards: message.hasForwards,
						},
					],
					data: [
						(
							await VK.user
								.getVK()
								.api.messages.getById({ message_ids: message.id })
						).items[0],
					],
				}).save();
				break;
			}
			case "message_edit": {
				const oldMessageData = await DB.user.models.message.findOne({
					id: message.id,
				});
				if (oldMessageData) {
					oldMessageData.events.push({
						updatedAt: message.updatedAt || 0,
						text: message.text || "",
						attachments: message.attachments.map((x) => {
							return x.toString();
						}),
						type: message.type,
						subTypes: message.subTypes || [],
						hasReply: message.hasReplyMessage,
						hasForwards: message.hasForwards,
					});
					const newMessageData = (
						await VK.user
							.getVK()
							.api.messages.getById({ message_ids: message.id })
					).items[0];
					oldMessageData.data.push(newMessageData);
					if (message.updatedAt) {
						oldMessageData.updated = new Date(message.updatedAt * 1000);
					}
					await oldMessageData.save();

					const isTranscriptAudioMessage: boolean =
						(newMessageData.attachments &&
							newMessageData.attachments[0] &&
							newMessageData.attachments[0].audio_message &&
							newMessageData.attachments[0].audio_message.transcript_state ===
								"done") ||
						false;

					if (message.isInbox && !isTranscriptAudioMessage) {
						InternalUtils.user.processEditedMessage(message, oldMessageData);
					}
				}

				break;
			}
			default: {
				break;
			}
		}

		if (!message.isGroup) {
			const fixedSenderId = message.isOutbox
				? DB.config.VK.user.id
				: message.senderId;
			const userData = await this.getUserData(fixedSenderId);
			if (message.isChat === false) {
				userData.personalMessages.push(message.id);
			} else {
				userData.messages.push(message.id);
			}
			userData.updateDate = new Date();
			await userData.save();
		}

		if (message.isChat && message.chatId) {
			const chatData = await DB.user.models.chat.findOne({
				id: message.chatId,
			});
			if (!chatData) {
				const newChatData = new DB.user.models.chat({
					id: message.chatId,
					messages: [message.id],
					updateDate: new Date(),
					regDate: new Date(),
				});
				await newChatData.save();
			} else {
				chatData.messages.push(message.id);
				chatData.updateDate = new Date();
				await chatData.save();
			}
		}
	}

	public async getUserData(
		id: number,
	): Promise<ExtractDoc<typeof DB.user.schemes.user>> {
		const userData = await DB.user.models.user.findOne({
			id,
		});
		if (!userData) {
			const [VK_USER_DATA] = await VK.user
				.getVK()
				.api.users.get({ user_id: id, fields: UsersGetFields });
			const newUserData = new DB.user.models.user({
				id,
				info: {
					name: VK_USER_DATA.first_name,
					surname: VK_USER_DATA.last_name,
					gender: VK_USER_DATA.sex || 0,
					last_seen:
						VK_USER_DATA.last_seen && VK_USER_DATA.last_seen.time
							? {
									date: new Date(VK_USER_DATA.last_seen.time * 1000),
									isOnline: false,
							  }
							: null,
					extends: {
						name_nom: VK_USER_DATA.first_name_nom,
						name_gen: VK_USER_DATA.first_name_gen,
						name_dat: VK_USER_DATA.first_name_dat,
						name_acc: VK_USER_DATA.first_name_acc,
						name_ins: VK_USER_DATA.first_name_ins,
						name_abl: VK_USER_DATA.first_name_abl,
						surname_nom: VK_USER_DATA.last_name_nom,
						surname_gen: VK_USER_DATA.last_name_gen,
						surname_dat: VK_USER_DATA.last_name_dat,
						surname_acc: VK_USER_DATA.last_name_acc,
						surname_ins: VK_USER_DATA.last_name_ins,
						surname_abl: VK_USER_DATA.last_name_abl,
						domain: VK_USER_DATA.domain,
						photo_max_orig: VK_USER_DATA.photo_max_orig,
						status: VK_USER_DATA.status,
					},
					isBot: false,
					isTrack: false,
					lastUpdate: new Date(),
				},
				messages: [],
				personalMessages: [],
				updateDate: new Date(),
				regDate: new Date(),
			});
			await newUserData.save();
			return newUserData;
		}
		return userData;
	}

	public async updateUserData(
		user: UsersUserFull,
		databaseUser: ExtractDoc<typeof DB.user.schemes.user>,
	): Promise<void> {
		databaseUser.info.name = user.first_name;
		databaseUser.info.extends.name_nom = user.first_name_nom!;
		databaseUser.info.extends.name_gen = user.first_name_gen!;
		databaseUser.info.extends.name_dat = user.first_name_dat!;
		databaseUser.info.extends.name_acc = user.first_name_acc!;
		databaseUser.info.extends.name_ins = user.first_name_ins!;
		databaseUser.info.extends.name_abl = user.first_name_abl!;

		databaseUser.info.surname = user.last_name;
		databaseUser.info.extends.surname_nom = user.last_name_nom!;
		databaseUser.info.extends.surname_gen = user.last_name_gen!;
		databaseUser.info.extends.surname_dat = user.last_name_dat!;
		databaseUser.info.extends.surname_acc = user.last_name_acc!;
		databaseUser.info.extends.surname_ins = user.last_name_ins!;
		databaseUser.info.extends.surname_abl = user.last_name_abl!;

		databaseUser.info.extends.domain = user.domain!;

		databaseUser.info.extends.photo_max_orig = user.photo_max_orig!;

		databaseUser.info.extends.status = user.status!;

		databaseUser.info.lastUpdate = new Date();

		databaseUser.markModified("info");

		await databaseUser.save();
	}

	public async updateTrackUserData(
		id: number,
		userInfo?: UsersUserFull,
	): Promise<void> {
		if (!userInfo) {
			[userInfo] = await VK.user.getVK().api.users.get({
				user_ids: id.toString(),
				fields: UsersGetFields,
			});
		}
		const databaseUser = await DB.user.models.user.findOne({ id: userInfo.id });
		if (!databaseUser) {
			throw new Error("User not found");
		}

		let log = `Track Log: @id${userInfo.id} (${userInfo.first_name} ${userInfo.last_name}):`;
		const userStickerPacks = await utils.vk.user.getUserStickerPacks(
			VK.fakes.getUserFakeAPI().options.token,
			userInfo.id,
		);
		const newUserStickerPacks = userStickerPacks.items.filter(
			(x) => x.purchaseDate! < databaseUser.info.lastUpdate,
		);
		if (newUserStickerPacks.length > 0) {
			const totalPrice = utils.array.number.total(
				newUserStickerPacks.map((x) => x.price),
			);
			log += `\nУ пользователя появились новые стикеры: ${newUserStickerPacks
				.map((x) => x.name)
				.join(",")} на сумму ${utils.number.separator(totalPrice * 7, ".")}₽`;
		}
		if (
			log !==
			`Track Log: @id${userInfo.id} (${userInfo.first_name} ${userInfo.last_name}):`
		) {
			InternalUtils.logger.send(log, "user_track");
		}
	}

	public async reserveScreenName(domain: string): Promise<number> {
		try {
			await resolveResource({ resource: domain, api: VK.group.getVK().api });
		} catch (error) {
			if (error instanceof ResourceError) {
				const group = await VK.user.getVK().api.groups.create({
					title: `Reserve ${domain}`,
				});
				await VK.user.getVK().api.groups.edit({
					group_id: group.id,
					screen_name: domain,
					access: 2,
				});
				return group.id;
			} else {
				throw new Error("Unknown error");
			}
		}
		throw new Error("Domain already used");
	}

	public async getFriendsBirthday(date: Date): Promise<BirthdayUser[]> {
		const birthdays: BirthdayUser[] = [];
		const validDate = moment(date).format("D.M");

		const iterator = createCollectIterator<FriendsUserXtrLists>({
			api: VK.user.getVK().api,
			method: "friends.get",
			params: {
				fields: [`bdate`],
			},
			countPerRequest: 5000,
		});

		for await (const chunk of iterator) {
			for (const user of chunk.items) {
				if (user.bdate) {
					if (moment(user.bdate, "D.M.YYYY").format("D.M") === validDate) {
						birthdays.push({
							id: user.id,
							name: user.first_name,
							surname: user.last_name,
						});
					}
				}
			}
		}

		return birthdays;
	}

	private async uploadAttachments(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		attachments: any[],
		chat: number,
	): Promise<
		{
			link: string;
			type: string;
		}[]
	> {
		const response: {
			link: string;
			type: string;
		}[] = [];
		for (const attachment of attachments) {
			switch (attachment.type) {
				case "story": {
					const story = attachment.story;
					if (story.type === "photo") {
						story.photo.sizes.sort(
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

						const uploadedStory = await VK.group.getVK().upload.messagePhoto({
							peer_id: 2e9 + chat,
							source: {
								value: story.photo.sizes[0].url,
							},
						});

						response.push({
							type: `История из фото ${story.is_one_time ? "(временная)" : ""}`,
							link: uploadedStory.toString(),
						});
					}

					if (story.type === "video") {
						const resolutionKeys = Object.keys(story.video.files);
						const resolutionArray = resolutionKeys.map((x) =>
							Number(x.split("_")[1]),
						);
						const maxResolution = utils.array.number.max(resolutionArray);

						const uploadedStory = await VK.group
							.getVK()
							.upload.messageDocument({
								peer_id: 2e9 + chat,
								source: {
									value:
										story.video.files[
											resolutionKeys[resolutionArray.indexOf(maxResolution)]
										],
									contentType: "video/mp4",
									filename: "video.mp4",
								},
							});

						response.push({
							type: `История из видео ${
								story.is_one_time ? "(временная)" : ""
							}`,
							link: uploadedStory.toString(),
						});
					}
					break;
				}
				case "photo": {
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
					const maxResolutionPhoto = photo.sizes[0];

					const uploadedPhoto = await VK.group.getVK().upload.messagePhoto({
						peer_id: 2e9 + chat,
						source: {
							value: maxResolutionPhoto.url,
						},
					});

					response.push({
						type: `Фотография (${maxResolutionPhoto.width} x ${maxResolutionPhoto.height})`,
						link: uploadedPhoto.toString(),
					});
					break;
				}
				case "video": {
					const video = attachment.video;

					const uploadedVideo = await VK.group.getVK().upload.messageDocument({
						peer_id: 2e9 + chat,
						source: {
							value: video.files.src,
							filename: video.title,
						},
					});

					response.push({
						type: "Видео",
						link: uploadedVideo.toString(),
					});

					break;
				}
				case "audio": {
					const audio = attachment.audio;

					response.push({
						type: "Аудиозапись",
						link: `audio${audio.owner_id}_${audio.id}_${audio.access_key}`,
					});
					break;
				}
				case "doc": {
					const doc = attachment.doc;

					const uploadedDoc = await VK.group.getVK().upload.messageDocument({
						peer_id: 2e9 + chat,
						source: {
							value: doc.url,
							filename: doc.title,
						},
					});

					response.push({
						type: "Документ",
						link: uploadedDoc.toString(),
					});
					break;
				}
				default: {
					break;
				}
			}
		}

		return response;
	}
}

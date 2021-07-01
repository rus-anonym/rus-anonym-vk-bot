import utils from "rus-anonym-utils";
import { createCollectIterator, Objects } from "vk-io";
import { UsersFields } from "vk-io/lib/api/schemas/objects";

import { UserCommand } from "../../../utils/lib/commands";
import VK from "../../../VK/core";
import InternalUtils from "../../../utils/core";
import DB from "../../../DB/core";
import moment from "moment";

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

new UserCommand(/(?:^!отчёт)(?:\s(.*))?$/i, async function (message) {
	await message.loadMessagePayload();
	let userID;
	try {
		userID = await InternalUtils.userCommands.getUserId(message);
	} catch (error) {
		return await message.sendMessage({
			message: error.message,
		});
	}

	const startedDate = moment();

	const [userData] = await VK.fakes.getUserFakeAPI().users.get({
		user_ids: userID.toString(),
		fields: UsersGetFields,
	});

	const userRegistrationDate = await utils.vk.user.getUserRegDate(userData.id);

	await message.reply({
		message: `Готовлю отчёт на @id${userData.id} (${userData.first_name_acc} ${userData.last_name_acc})`,
	});

	InternalUtils.logger.send(
		`Report @id${userData.id}: Начинаю загрузку друзей`,
		"info",
	);

	const friendsIterator = createCollectIterator<Objects.FriendsUserXtrLists>({
		api: VK.fakes.getUserFakeAPI(),
		method: "friends.get",
		params: {
			user_id: userData.id,
			fields: UsersGetFields,
		},
		countPerRequest: 1000,
		parallelRequests: 1,
	});

	const userFriends: Array<{ name: string; surname: string; id: number }> = [];
	const possibleRelatives: number[] = [];
	const sameCity: number[] = [];
	const sameSchools: number[] = [];

	for await (const chunk of friendsIterator) {
		for (const friend of chunk.items) {
			if (utils.string.levenshtein(userData.last_name, friend.last_name) < 2) {
				possibleRelatives.push(friend.id);
			}

			if (userData.city?.id === friend.city?.id) {
				sameCity.push(friend.id);
			}

			const userSchoolsIDs = userData.schools?.map((x) => x.id);
			const friendSchoolsIDs = userData.schools?.map((x) => x.id);

			if (userSchoolsIDs?.some((x) => friendSchoolsIDs?.includes(x))) {
				sameSchools.push(friend.id);
			}

			userFriends.push({
				name: friend.first_name,
				surname: friend.last_name,
				id: friend.id,
			});
		}
	}

	const possibleRightPeople = utils.array.makeUnique(
		possibleRelatives.concat(sameCity, sameSchools),
	);

	InternalUtils.logger.send(
		`Report @id${userData.id}: Загрузка друзей завершена
Начинаю загрузку групп`,
		"info",
	);

	let userGroups: {
		id: number;
		title: string;
		friends: number[];
	}[] = [];

	const groupsIterator = createCollectIterator<Objects.GroupsGroupFull>({
		api: VK.fakes.getUserFakeAPI(),
		method: "groups.get",
		params: {
			user_id: userData.id,
			extended: 1,
		},
		countPerRequest: 500,
	});

	for await (const chunk of groupsIterator) {
		chunk.items.map((group) =>
			userGroups.push({
				id: group.id,
				title: group.name,
				friends: [],
			}),
		);
	}

	InternalUtils.logger.send(
		`Report @id${userData.id}: Загрузка групп завершена
Начинаю проверку друзей в группах`,
		"info",
	);

	for (const group of userGroups) {
		for (const friendsChunk of utils.array.splitTo(possibleRightPeople, 500)) {
			const friends = (await VK.fakes.getUserFakeAPI().groups.isMember({
				group_id: group.id.toString(),
				user_ids: friendsChunk,
			})) as unknown as Array<{
				user_id: number;
				member: number;
			}>;

			for (const friend of friends.filter((x) => x.member === 1)) {
				group.friends.push(friend.user_id);
			}
		}
	}

	InternalUtils.logger.send(
		`Report @id${userData.id}: Проверка друзей закончена
Генерирую отчёт...`,
		"info",
	);

	userGroups.sort((a, b) => {
		if (a.friends.length > b.friends.length) {
			return 1;
		}
		if (b.friends.length < b.friends.length) {
			return -1;
		}
		return 0;
	});

	userGroups = userGroups.filter((group) => group.friends.length > 0);

	const finishedDate = moment();

	let reportText = `Отчёт по пользователю https://vk.com/id${userData.id} (${
		userData.first_name_dat
	} ${userData.last_name_dat})
Начата обработка в ${startedDate.format("HH:mm:ss, DD.MM.YYYY")}
Закончена обработка в ${finishedDate.format("HH:mm:ss, DD.MM.YYYY")}
Итого потрачено ${utils.time.precizeDiff(startedDate, finishedDate)}

Дата регистрации пользователя: ${moment(userRegistrationDate).format(
		"HH:mm:ss, DD.MM.YYYY",
	)}

Вероятные родственники:
${
	possibleRelatives.length > 0
		? possibleRelatives
				.map((relatedID, index) => {
					const relatedInfo = userFriends.find(
						(friend) => friend.id === relatedID,
					);
					return `${index + 1}. ${relatedInfo?.name} ${relatedInfo?.surname}
https://vk.com/id${relatedInfo?.id}`;
				})
				.join(`\n`)
		: "Не обнаружены"
}

Вероятные одноклассники:
${
	sameSchools.length > 0
		? sameSchools
				.map((classmateID, index) => {
					const relatedInfo = userFriends.find(
						(friend) => friend.id === classmateID,
					);
					return `${index + 1}. ${relatedInfo?.name} ${relatedInfo?.surname}
https://vk.com/id${relatedInfo?.id}`;
				})
				.join(`\n`)
		: "Не обнаружены"
}

Вероятно из одного города:
${
	sameCity.length > 0
		? sameCity
				.map((citizenID, index) => {
					const relatedInfo = userFriends.find((x) => x.id === citizenID);
					return `${index + 1}. ${relatedInfo?.name} ${relatedInfo?.surname}
https://vk.com/id${relatedInfo?.id}`;
				})
				.join(`\n`)
		: "Не обнаружены"
}

Состоят в одних и тех-же группах:
${
	userGroups.length > 0
		? userGroups
				.map((group, groupIndex) => {
					const friendsInGroup = group.friends.map((friend, friendIndex) => {
						const relatedInfo = userFriends.find((x) => x.id === friend);
						return `${friendIndex + 1}. ${relatedInfo?.name} ${
							relatedInfo?.surname
						}
https://vk.com/id${relatedInfo?.id}`;
					});
					return `${groupIndex + 1}. ${group.title}
https://vk.com/id${group.id}
\t${friendsInGroup.join("\n\t")}`;
				})
				.join("\n")
		: "Групп не обнаружено"
}`;

	const userStickers = await utils.vk.user.getUserStickerPacks(
		VK.fakes.getUserFakeAPI().options.token,
		userData.id,
	);

	reportText += `Стикеры пользователя: 
Потрачено: ${utils.number.separator(
		userStickers.total_price,
		".",
	)} голосов, либо ${utils.number.separator(userStickers.total_price * 7, ".")}₽
${userStickers.items
	.map((pack, index) => {
		return `${index}. ${pack.name}
Автор: ${pack.author}
Описание: ${pack.description}
Цена: ${pack.price}`;
	})
	.join(`\n`)}`;

	InternalUtils.logger.send(
		`Готов отчёт по пользователю @id${userData.id} (${userData.first_name_dat} ${userData.last_name_dat})`,
		"info",
		{
			attachment: (
				await VK.group.getVK().upload.messageDocument({
					source: {
						value: Buffer.from(reportText, "utf-8"),
						filename: `report#${userData.id}.txt`,
					},
					peer_id: 2e9 + DB.config.VK.group.logs.conversations.errors,
				})
			).toString(),
		},
	);
});

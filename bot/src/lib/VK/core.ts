import { IConfigSubGroup } from "./../../DB/IConfig";
import { VK, CallbackService, API, WallPostContext, getRandomId } from "vk-io";
import utils from "rus-anonym-utils";

import InternalUtils from "../utils/core";
import DB from "../DB/core";

import authorizationManager from "./plugins/authorization";
import BotPodVK from "./plugins/BotPod";
import VKMe from "./plugins/VKMe";
import FakesAlpha from "./plugins/Fakes";
import captchaHandler from "./plugins/captchaHandler";
import questionManagers from "./plugins/questionManager";

import masterMiddlewares from "./middlewares/master";
import slaveMiddlewares from "./middlewares/slave";
import mainGroupMiddlewares from "./middlewares/group";
import subGroupMiddlewares from "./middlewares/subGroup";

const userCallbackService = new CallbackService();
userCallbackService.onCaptcha(captchaHandler);

const plug = () => null;

abstract class Worker {
	abstract main: VK;
	abstract additional: VK[];

	public getVK(): VK {
		return utils.array.random(this.additional);
	}

	public getAPI(): API {
		return this.getVK().api;
	}
}

class MasterVK extends Worker {
	public main = new VK({
		token: DB.config.VK.user.master.tokens.main,
		callbackService: userCallbackService,
		...DB.constants.vk.master.defaultParams,
	});

	public additional = DB.config.VK.user.master.tokens.additional.map(
		(token) => {
			return new VK({
				token,
				callbackService: userCallbackService,
				...DB.constants.vk.master.defaultParams,
			});
		},
	);

	constructor() {
		super();
		// this.main.updates.use((event, next) => {
		// 	console.log(event);
		// 	next();
		// });
		this.main.updates.on(
			"message_new",
			authorizationManager.middleware.bind(authorizationManager),
		);
		this.main.updates.on("message_new", masterMiddlewares.messageNew);
		this.main.updates.on("message_edit", masterMiddlewares.messageEdit);
		this.main.updates.on("message_flags", masterMiddlewares.messageFlags);

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		this.main.updates.on("chat_screenshot", plug);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		this.main.updates.on("conversation_style_update", plug);
		this.main.updates.on("chat_create", plug);
		this.main.updates.on("chat_title_update", plug);
		this.main.updates.on("chat_pin_message", plug);
		this.main.updates.on("chat_unpin_message", plug);
		this.main.updates.on("chat_kick_user", plug);
		this.main.updates.on("chat_invite_user", plug);
		this.main.updates.on("chat_invite_user_by_link", plug);
		this.main.updates.on("messages_read", plug);
		this.main.updates.on("typing", plug);
		this.main.updates.on("dialog_flags", plug);
		this.main.updates.on("friend_activity", plug);
		this.main.updates.use(async (event) => {
			InternalUtils.logger.send({
				message: `Необработанное событие пользователя:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				type: "error",
				params: {
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id:
								2000000000 + DB.config.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			});
		});
	}

	public botpod = new BotPodVK();
	public vkMe = new VKMe();
}

class GroupVK extends Worker {
	public main = new VK({
		token: DB.config.VK.group.tokens.main,
	});

	public additional = DB.config.VK.group.tokens.additional.map((token) => {
		return new VK({ token });
	});

	constructor() {
		super();
		this.main.updates.use(questionManagers.groupQuestionManager.middleware);
		this.main.updates.on("message_new", mainGroupMiddlewares.messageNew);
		this.main.updates.on("wall_post_new", mainGroupMiddlewares.wallPostNew);
		this.main.updates.on("user_block", mainGroupMiddlewares.userBlock);
		this.main.updates.on("user_unblock", mainGroupMiddlewares.userUnblock);
		this.main.updates.on(
			"group_officers_edit",
			mainGroupMiddlewares.groupOfficersEdit,
		);
		this.main.updates.on("photo_comment", plug);
		this.main.updates.on("group_join", plug);
		this.main.updates.on("group_leave", plug);
		this.main.updates.on("like_add", plug);
		this.main.updates.on("like_remove", plug);
		this.main.updates.on("message_reply", plug);
		this.main.updates.on("message_typing_state", plug);
		this.main.updates.on("typing_group", plug);
		this.main.updates.on("chat_kick_user", plug);
		this.main.updates.on("chat_invite_user", plug);
		this.main.updates.on("wall_reply", plug);
		this.main.updates.on("message_edit", plug);
		this.main.updates.on("video_comment", plug);
		this.main.updates.use(async (event) => {
			InternalUtils.logger.send({
				message: `Необработанное событие группы:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				type: "error",
				params: {
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id:
								2000000000 + DB.config.VK.group.logs.conversations.errors,
						})
					).toString(),
				},
			});
		});
	}
}

class SubGroupVK extends Worker {
	public id: number;
	public main;
	public additional;

	constructor(config: IConfigSubGroup) {
		super();
		this.id = config.id;
		this.main = new VK({
			token: config.tokens.main,
		});
		this.additional = config.tokens.additional.map(
			(token) => new VK({ token }),
		);
		this.main.updates.on(
			"message_new",
			subGroupMiddlewares.createSubGroupMessageNewHandler(this),
		);
		this.main.updates.on(
			"user_block",
			subGroupMiddlewares.createSubGroupUserBlockHandler(this),
		);
		this.main.updates.on(
			"user_unblock",
			subGroupMiddlewares.createSubGroupUserUnblockHandler(this),
		);
	}
}

class SlaveVK extends Worker {
	public main = new VK({
		token: DB.config.VK.user.slave.tokens.main,
		callbackService: userCallbackService,
		...DB.constants.vk.slave.defaultParams,
	});

	public additional = DB.config.VK.user.slave.tokens.additional.map((token) => {
		return new VK({
			token,
			callbackService: userCallbackService,
			...DB.constants.vk.slave.defaultParams,
		});
	});

	constructor() {
		super();
		this.main.updates.on("message_new", slaveMiddlewares.messageNew);
	}
}

class CoreVK {
	public master = new MasterVK();
	public slave = new SlaveVK();
	public group = new GroupVK();
	public subGroups = DB.config.VK.subGroups.map(
		(config) => new SubGroupVK(config),
	);
	public fakes = new FakesAlpha();
}

const vk = new CoreVK();

const repostsMiddleware = async (event: WallPostContext) => {
	for (const peer_id of DB.config.VK.groupReposts.chats) {
		if (event.wall.postType !== "suggest") {
			await vk.slave.getAPI().messages.send({
				peer_id,
				attachment: event.wall.toString(),
				random_id: getRandomId(),
			});
		}
	}

	for (const fake of vk.fakes.list) {
		await fake.getAPI().likes.add({
			item_id: event.wall.id,
			owner_id: event.wall.ownerId,
			type: "post",
		});
	}
	return;
};

for (const group of DB.config.VK.groupReposts.tokens) {
	const tempVK = new VK({
		token: group.token,
		pollingGroupId: group.id,
	});
	tempVK.updates.on("wall_post_new", repostsMiddleware);
	tempVK.updates.startPolling();
}

export default vk;

export { Worker, MasterVK, SlaveVK, GroupVK, SubGroupVK };

import { VK, CallbackService, API, WallPostContext, getRandomId } from "vk-io";
import utils from "rus-anonym-utils";

import InternalUtils from "../utils/core";
import DB from "../DB/core";

import authorizationManager from "./plugins/authorization";
import BotPodVK from "./plugins/BotPod";
import VKMe from "./plugins/VKMe";
import FakesAlpha from "./plugins/Fakes";
import captchaHandler from "./plugins/captchaHandler";

import masterMiddlewares from "./middlewares/master";
import slaveMiddlewares from "./middlewares/slave";
import groupMiddlewares from "./middlewares/group";

const userCallbackService = new CallbackService();
userCallbackService.onCaptcha(captchaHandler);

const plug = () => null;

abstract class Worker {
	abstract main: VK;
	abstract additional: string[];

	abstract getVK(): VK;
	abstract getAPI(): API;
}

class MasterVK extends Worker {
	public main = new VK({
		token: DB.config.VK.user.master.tokens.main,
		callbackService: userCallbackService,
		...DB.constants.vk.master.defaultParams,
	});

	public additional = DB.config.VK.user.master.tokens.additional.map(
		(token) => {
			return token;
		},
	);

	constructor() {
		super();
		// this.main.updates.use((event, next) => {
		// 	console.log(event);
		// 	next();
		// });
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
		this.main.updates.on(
			"message_new",
			authorizationManager.middleware.bind(authorizationManager),
		);
		this.main.updates.on("message_new", masterMiddlewares.messageNew);
		this.main.updates.on("message_edit", masterMiddlewares.messageEdit);
		this.main.updates.on("message_flags", masterMiddlewares.messageFlags);
		this.main.updates.on("friend_activity", masterMiddlewares.friendActivity);
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

	public getAPI() {
		return new API({
			token: utils.array.random(this.additional),
			callbackService: userCallbackService,
			...DB.constants.vk.master.defaultParams,
		});
	}

	public getVK() {
		return new VK({
			token: utils.array.random(this.additional),
			callbackService: userCallbackService,
			...DB.constants.vk.master.defaultParams,
		});
	}
}

class GroupVK extends Worker {
	public main = new VK({
		token: DB.config.VK.group.tokens.main,
	});

	public additional = DB.config.VK.group.tokens.additional.map((token) => {
		return token;
	});

	constructor() {
		super();
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
		this.main.updates.on("message_new", groupMiddlewares.messageNew);
		this.main.updates.on("wall_post_new", groupMiddlewares.wallPostNew);
		this.main.updates.on("user_block", groupMiddlewares.userBlock);
		this.main.updates.on("user_unblock", groupMiddlewares.userUnblock);
		this.main.updates.on(
			"group_officers_edit",
			groupMiddlewares.groupOfficersEdit,
		);
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

	public getAPI() {
		return new API({
			token: utils.array.random(this.additional),
		});
	}

	public getVK() {
		return new VK({
			token: utils.array.random(this.additional),
		});
	}
}

class SlaveVK extends Worker {
	public main = new VK({
		token: DB.config.VK.user.slave.tokens.main,
		callbackService: userCallbackService,
		...DB.constants.vk.slave.defaultParams,
	});

	public additional = DB.config.VK.user.slave.tokens.additional.map((token) => {
		return token;
	});

	constructor() {
		super();
		this.main.updates.on("message_new", slaveMiddlewares.messageNew);
		this.main.updates.on("message_edit", slaveMiddlewares.messageEdit);
	}

	public getAPI() {
		return new API({
			token: utils.array.random(this.additional),
			callbackService: userCallbackService,
			...DB.constants.vk.slave.defaultParams,
		});
	}

	public getVK() {
		return new VK({
			token: utils.array.random(this.additional),
			callbackService: userCallbackService,
			...DB.constants.vk.slave.defaultParams,
		});
	}
}

class CoreVK {
	public master = new MasterVK();
	public slave = new SlaveVK();
	public group = new GroupVK();
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

import { VK, API } from "vk-io";
import utils from "rus-anonym-utils";

import InternalUtils from "../utils/core";
import DB from "../DB/core";
import userMiddlewares from "./middlewares/user";
import groupMiddlewares from "./middlewares/group";

abstract class Worker {
	/**
	 * Основной инстанс вк ио который юзается для поллинга
	 */
	abstract main: VK;

	/**
	 * Дополнительные инстансы вк ио
	 */
	abstract additional: VK[];

	abstract configure(): this;

	/**
	 * Получение рандомного дополнительного инстанса
	 */
	public getVK(): VK {
		return utils.array.random(this.additional);
	}
}

abstract class FakeWorker {
	abstract additional: API[];
	public getAPI(): API {
		return utils.array.random(this.additional);
	}
}

interface FakeUserData {
	id: number;
	tokens: string[];
}

class FakeUserVK extends FakeWorker {
	public additional: API[] = [];
	constructor(data: FakeUserData) {
		super();
		for (const token of data.tokens) {
			this.additional.push(new API({ token }));
		}
	}
}

class FakesAlpha {
	public user: FakeUserVK[] = [];

	constructor() {
		for (const fakeUser of DB.config.vk.userFakes) {
			this.user.push(new FakeUserVK(fakeUser));
		}
	}

	public getUserFake(): FakeUserVK {
		return utils.array.random(this.user);
	}

	public getUserFakeAPI(): API {
		return utils.array.random(this.user).getAPI();
	}
}

class UserVK extends Worker {
	public main = new VK({ token: DB.config.vk.user.tokens[0] });

	public additional = DB.config.vk.user.tokens.splice(1).map((token) => {
		return new VK({ token });
	});

	public configure() {
		// this.main.updates.use((event, next) => {
		// 	console.log(event);
		// 	next();
		// });
		this.main.updates.on("message_new", userMiddlewares.messageNew);
		this.main.updates.on("message_edit", userMiddlewares.messageEdit);
		this.main.updates.on("message_flags", userMiddlewares.messageFlags);
		this.main.updates.on("friend_activity", userMiddlewares.friendActivity);
		this.main.updates.on("messages_read", () => null);
		this.main.updates.on("typing", () => null);
		this.main.updates.on("dialog_flags", () => null);
		this.main.updates.use(async (event) => {
			InternalUtils.logger.send(
				`Необработанное событие пользователя:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				"error",
				{
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id: 2e9 + DB.config.vk.group.logs.conversations.errors,
						})
					).toString(),
				},
			);
		});
		return this;
	}
}

class GroupVK extends Worker {
	public main = new VK({ token: DB.config.vk.group.tokens[0] });

	public additional = DB.config.vk.group.tokens.splice(1).map((token) => {
		return new VK({ token });
	});

	public configure() {
		this.main.updates.on("message_new", groupMiddlewares.messageNew);
		this.main.updates.on("message_reply", () => null);
		this.main.updates.on("message_typing_state", () => null);
		this.main.updates.on("typing_group", () => null);
		this.main.updates.on("like_add", groupMiddlewares.likeAdd);
		this.main.updates.on("like_remove", groupMiddlewares.likeRemove);
		this.main.updates.on("wall_post_new", groupMiddlewares.wallPostNew);
		this.main.updates.on("group_join", groupMiddlewares.groupJoin);
		this.main.updates.on("group_leave", groupMiddlewares.groupLeave);
		this.main.updates.on(
			"group_officers_edit",
			groupMiddlewares.groupOfficersEdit,
		);
		this.main.updates.use(async (event) => {
			InternalUtils.logger.send(
				`Необработанное событие группы:
Type: ${event.type}
SubTypes: ${JSON.stringify(event.subTypes)}`,
				"error",
				{
					attachment: (
						await vk.group.getVK().upload.messageDocument({
							source: {
								value: Buffer.from(
									JSON.stringify(event.toJSON(), null, "\t"),
									"utf-8",
								),
								filename: "event.txt",
							},
							peer_id: 2e9 + DB.config.vk.group.logs.conversations.errors,
						})
					).toString(),
				},
			);
		});
		return this;
	}
}

class CoreVK {
	public user = new UserVK().configure();
	public group = new GroupVK().configure();
	public fakes = new FakesAlpha();
}

const vk = new CoreVK();

export default vk;

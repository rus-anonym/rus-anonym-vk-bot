import { VK } from "vk-io";
import utils from "rus-anonym-utils";

import InternalUtils from "../utils/core";
import DB from "../DB/core";
import userMiddlewares from "./middlewares/user";

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
		this.main.updates.on("message", userMiddlewares.messageHandler);
		this.main.updates.on("message_flags", userMiddlewares.messageFlagsHandler);
		this.main.updates.on(
			"friend_activity",
			userMiddlewares.friendActivityHandler,
		);
		this.main.updates.on("messages_read", () => null);
		this.main.updates.on("typing", () => null);
		this.main.updates.on("dialog_flags", () => null);
		this.main.updates.use(async (event) => {
			InternalUtils.logger.send(
				`Необработанное событие:
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
		return this;
	}
}

class CoreVK {
	public user = new UserVK().configure();
	public group = new GroupVK().configure();
}

const vk = new CoreVK();

export default vk;

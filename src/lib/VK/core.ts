import { VK } from "vk-io";
import utils from "rus-anonym-utils";

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
		this.main.updates.on("message", userMiddlewares.messageHandler);
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

export default new CoreVK();

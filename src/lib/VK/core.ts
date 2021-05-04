import { VK } from "vk-io";
import utils from "rus-anonym-utils";

import DB from "../DB/core";

abstract class Worker {
	abstract main: VK;
	abstract additional: VK[];

	public getVK(): VK {
		return utils.array.random(this.additional);
	}
}

class UserVK extends Worker {
	public main = new VK({ token: DB.config.vk.user.tokens[0] });

	public additional = DB.config.vk.user.tokens.splice(1).map((token) => {
		return new VK({ token });
	});
}

class GroupVK extends Worker {
	public main = new VK({ token: DB.config.vk.group.tokens[0] });

	public additional = DB.config.vk.group.tokens.splice(1).map((token) => {
		return new VK({ token });
	});
}

class CoreVK {
	public user = new UserVK();
	public group = new GroupVK();
}

export default new CoreVK();

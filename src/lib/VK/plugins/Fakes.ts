import utils from "rus-anonym-utils";
import { API, CallbackService } from "vk-io";

import DB from "../../DB/core";

import captchaHandler from "./captchaHandler";

const callbackService = new CallbackService();

callbackService.onCaptcha(captchaHandler);

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
			this.additional.push(
				new API({
					token,
					callbackService,
					apiVersion: "5.157",
					apiHeaders: {
						"User-Agent":
							"VKAndroidApp/1.00-0000 (Linux; RusAnonym; BOT; ru; 0x0)",
					},
				}),
			);
		}
	}
}

class FakesAlpha {
	public list: FakeUserVK[] = [];

	constructor() {
		for (const fakeUser of DB.config.VK.userFakes) {
			this.list.push(new FakeUserVK(fakeUser));
		}
	}

	public getUserFake(): FakeUserVK {
		return utils.array.random(this.list);
	}

	public getUserFakeAPI(): API {
		return utils.array.random(this.list).getAPI();
	}
}

export default FakesAlpha;

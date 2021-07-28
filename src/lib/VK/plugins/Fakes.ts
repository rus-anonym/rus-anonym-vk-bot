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
					...DB.constants.vk.fake.defaultParams,
				}),
			);
		}
	}
}

class FakesAlpha {
	public list: FakeUserVK[] = [];

	constructor() {
		for (const fakeUser of DB.staticConfig.VK.userFakes) {
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

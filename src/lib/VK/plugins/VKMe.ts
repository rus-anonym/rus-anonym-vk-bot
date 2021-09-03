import { API, CallbackService } from "vk-io";

import DB from "../../DB/core";
import captchaHandler from "./captchaHandler";

const callbackService = new CallbackService();
callbackService.onCaptcha(captchaHandler);

class VKMe extends API {
	constructor() {
		super({
			token: DB.config.VK.user.master.tokens.apps[6146827],
			callbackService,
			...DB.constants.vk.user.defaultParams,
		});
	}
}

export default VKMe;

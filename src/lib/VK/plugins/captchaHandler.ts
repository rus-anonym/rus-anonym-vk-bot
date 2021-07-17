import { Captcha, Solver } from "rucaptcha-io";

import { ICallbackServiceCaptchaPayload, CallbackServiceRetry } from "vk-io";

import DB from "../../DB/core";
import InternalUtils from "../../utils/core";

const solver = new Solver({
	token: DB.config.rucaptcha.token,
});

async function captchaHandler(
	payload: ICallbackServiceCaptchaPayload,
	retry: CallbackServiceRetry,
): Promise<void> {
	const captcha = new Captcha(payload.src, solver);
	const key = await captcha.auto();
	try {
		await retry(key);
		captcha.markAnswerAsGood();
		InternalUtils.logger.send(
			`Captcha solve report
SID: ${payload.sid}
Type: ${payload.type}
${
	payload.request
		? `
Method: ${payload.request.method}
Params: ${JSON.stringify(payload.request.params, null, "\t")}
Attempt: ${payload.request.retries}`
		: ""
}
Status: Good`,
			"captcha",
		);
	} catch (error) {
		// captcha.markAnswerAsBad();
		InternalUtils.logger.send(
			`Captcha solve report
SID: ${payload.sid}
Type: ${payload.type}
${
	payload.request
		? `
Method: ${payload.request.method}
Params: ${JSON.stringify(payload.request.params, null, "\t")}
Attempt: ${payload.request.retries}`
		: ""
}
Status: Bad`,
			"captcha",
		);
	}
}

export default captchaHandler;

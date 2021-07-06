import axios from "axios";
import utils from "rus-anonym-utils";

import DB from "../DB/core";

class Captcha {
	private captchaSource: string;
	private base64!: string;
	private ruCaptchaSID!: number;
	public answer!: string;

	constructor(source: string) {
		this.captchaSource = source;
	}

	private async loadImage(): Promise<void> {
		const image = await axios.get(this.captchaSource, {
			responseType: "arraybuffer",
		});
		this.base64 = Buffer.from(image.data, "binary").toString("base64");
	}

	private async sendToRuCaptcha(): Promise<void> {
		const response = await axios({
			method: "POST",
			url: "http://rucaptcha.com/in.php",
			params: {
				key: DB.config.rucaptcha.token,
				method: "base64",
				body: this.base64,
				json: 1,
			},
		});
		this.ruCaptchaSID = response.data.request;
	}

	private async checkResolve(): Promise<void> {
		const response = await axios({
			method: "POST",
			url: "http://rucaptcha.com/res.php",
			params: {
				key: DB.config.rucaptcha.token,
				action: "get",
				id: this.ruCaptchaSID,
				json: 1,
			},
		});
		if (response.data.status === 1) {
			this.answer = response.data.request;
		}
	}

	public async resolve(): Promise<string> {
		await this.loadImage();
		await this.sendToRuCaptcha();
		for (let i = 0; i < 30; ++i) {
			await utils.sleep(2000);
			await this.checkResolve();
			if (this.answer !== undefined) {
				i = 10;
			}
		}
		return this.answer;
	}

	public async good(): Promise<void> {
		await axios({
			method: "POST",
			url: "http://rucaptcha.com/res.php",
			params: {
				key: DB.config.rucaptcha.token,
				action: "reportgood",
				id: this.ruCaptchaSID,
				json: 1,
			},
		});
	}

	public async bad(): Promise<void> {
		await axios({
			method: "POST",
			url: "http://rucaptcha.com/res.php",
			params: {
				key: DB.config.rucaptcha.token,
				action: "reportbad",
				id: this.ruCaptchaSID,
				json: 1,
			},
		});
	}
}

export default Captcha;

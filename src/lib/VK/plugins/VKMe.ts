import { officialAppCredentials } from "@vk-io/authorization";

import { Authorization } from "./authorization";
import DB from "../../DB/core";

class VKMe extends Authorization {
	constructor() {
		super({
			app_id: officialAppCredentials.vkMe.clientId,
			scope: "0",
			secret: officialAppCredentials.vkMe.clientSecret,
			type: "ImplicitFlowUser",
			apiVersion: DB.constants.vk.user.defaultParams.apiVersion,
			apiOptions: {
				...DB.constants.vk.user.defaultParams,
			},
		});
	}
}

export default VKMe;

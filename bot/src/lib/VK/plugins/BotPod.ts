import { Authorization } from "./authorization";

class BotPod extends Authorization {
	constructor() {
		super({ app_id: 6441755, scope: "", secret: "", type: "ImplicitFlowUser" });
	}

	public addBotToChat(peer_id: number, bot_id: number): Promise<1> {
		return this.api.call("bot.addBotToChat", {
			peer_id,
			bot_id,
		});
	}

	public kickBot(peer_id: number, bot_id: number): Promise<1> {
		return this.api.call("bot.kickBot", {
			peer_id,
			bot_id,
		});
	}
}

export default BotPod;

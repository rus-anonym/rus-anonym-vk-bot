import { VK } from "vk-io";
import IVKInstance from "../../types/interfaces/vk";
import { config } from "../DB/core";

const user: IVKInstance = {
	id: config.vk.user.id,
	sessions: config.vk.user.additional.map((tempUserToken) => {
		return new VK({ token: tempUserToken });
	}),
	main: new VK({ token: config.vk.user.main }),
	getVK() {
		return this.sessions[Math.floor(Math.random() * this.sessions.length)];
	},
};

const group: IVKInstance = {
	id: config.vk.group.id,
	sessions: config.vk.group.additional.map((tempGroupToken) => {
		return new VK({ token: tempGroupToken });
	}),
	main: new VK({ token: config.vk.group.main }),
	getVK() {
		return this.sessions[Math.floor(Math.random() * this.sessions.length)];
	},
};

async function startPolling() {
	await user.main.updates.startPolling();
	await group.main.updates.startPolling();
}

export { user, group, startPolling };

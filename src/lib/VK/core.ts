import { VK } from "vk-io";
import IVKInstance from "../../types/interfaces/vk";
import DataBase from "../DB/core";

const user: IVKInstance = {
	id: DataBase.config.vk.user.id,
	sessions: DataBase.config.vk.user.additional.map((tempUserToken) => {
		return new VK({ token: tempUserToken });
	}),
	main: new VK({ token: DataBase.config.vk.user.main }),
	getVK() {
		return this.sessions[Math.floor(Math.random() * this.sessions.length)];
	},
};

const group: IVKInstance = {
	id: DataBase.config.vk.group.id,
	sessions: DataBase.config.vk.group.additional.map((tempGroupToken) => {
		return new VK({ token: tempGroupToken });
	}),
	main: new VK({
		pollingGroupId: DataBase.config.vk.group.id,
		token: DataBase.config.vk.group.main,
	}),
	getVK() {
		return this.sessions[Math.floor(Math.random() * this.sessions.length)];
	},
};

async function startPolling(): Promise<void> {
	await user.main.updates.startPolling();
	await group.main.updates.startPolling();
}

export { user, group, startPolling };

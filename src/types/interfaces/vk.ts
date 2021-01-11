import { VK } from "vk-io";

export default interface IVKInstance {
	id: number;
	sessions: VK[];
	main: VK;
	getVK(): VK;
}

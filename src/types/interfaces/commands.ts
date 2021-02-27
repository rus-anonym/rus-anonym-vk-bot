import { MessageContext, VK } from "vk-io";

export default interface ICommand {
	regexp: RegExp[];
	process(message: MessageContext, vk: VK): Promise<unknown> | unknown;
}

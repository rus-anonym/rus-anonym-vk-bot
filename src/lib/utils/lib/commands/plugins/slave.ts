import { resolveResource, MessageContext } from "vk-io";

import { UtilsCommands, SlaveCommand } from "../core";
import VK from "../../../../VK/core";

export default class UtilsSlaveCommands extends UtilsCommands {
	public list: SlaveCommand[] = [];

	public addCommand(command: SlaveCommand): void {
		this.list.push(command);
	}

	public findCommand(input: string): SlaveCommand | undefined {
		return this.list.find((x) => x.check(input));
	}

	public async getUserId(message: MessageContext): Promise<number> {
		if (message.forwards[0]) {
			return message.forwards[0].senderId;
		} else if (message.replyMessage) {
			return message.replyMessage.senderId;
		} else if (message.state.args[1]) {
			try {
				const linkData = await resolveResource({
					resource: message.state.args[1],
					api: VK.group.getVK().api,
				});
				if (linkData.type === "group") {
					return -linkData.id;
				} else if (linkData.type === "user") {
					return linkData.id;
				} else {
					throw new Error("Не смог распознать ссылку");
				}
			} catch (error) {
				throw new Error("Не смог распознать ссылку");
			}
		} else if (!message.isChat) {
			return message.peerId;
		} else {
			throw new Error("Не смог распознать ссылку");
		}
	}
}

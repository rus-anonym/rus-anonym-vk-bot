import { MessageFlagsContext } from "vk-io";

import InternalUtils from "../../../utils/core";

function userMessageFlags(event: MessageFlagsContext, next: () => void): void {
	if (event.isDeletedForAll) {
		InternalUtils.user.processDeletedMessage(event);
		return;
	}
	next();
}

export default userMessageFlags;

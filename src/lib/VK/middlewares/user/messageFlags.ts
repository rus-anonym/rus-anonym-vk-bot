import { MessageFlagsContext } from "vk-io";

import InternalUtils from "../../../utils/core";

function userMessageFlags(event: MessageFlagsContext, next: () => void): void {
	if (event.isDeletedForAll) {
		InternalUtils.user.processDeletedForAllMessage(event);
		return;
	}
	if (event.isDeleted) {
		InternalUtils.user.processDeletedMessage(event);
		return;
	}
	if (event.isAudioMessageListened || event.isImportant) {
		return;
	}
	next();
}

export default userMessageFlags;

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export default class UtilsCommands {
	public parseAudioURL(url: string): string {
		const m3u8 = url.indexOf("/index.m3u8");
		if (m3u8 !== -1) {
			url = url.substring(0, m3u8);
			url += ".mp3";
			const splittedUrl = url.split("/");
			splittedUrl.splice(4, 1);
			return splittedUrl.join("/");
		} else {
			return url.substring(0, url.indexOf(".mp3") + 4);
		}
	}

	public bytesToSize(bytes: number): string {
		if (bytes === 0) {
			return "0 Bytes";
		}
		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
	}
}

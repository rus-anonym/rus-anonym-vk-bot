/* eslint-disable @typescript-eslint/no-non-null-assertion */
import https from "https";
export default class UtilsCommands {
	public getDocumentSource(url: string): Promise<string> {
		return new Promise((resolve, reject) => {
			https.get(url, (res) => {
				if (res.headers.location) {
					return resolve(res.headers.location.split("?")[0]);
				} else {
					throw reject(new Error("URL not found"));
				}
			});
		});
	}

	public parseAudioURL(url: string): string {
		const source = url;
		const m3u8 = url.indexOf("/index.m3u8");
		if (m3u8 !== -1) {
			url = url.substring(0, m3u8);
			url += ".mp3";
			const splittedUrl = url.split("/");
			splittedUrl.splice(4, 1);
			url = splittedUrl.join("/");
		} else {
			url = url.substring(0, url.indexOf(".mp3") + 4);
		}
		return url !== "" ? url : source;
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

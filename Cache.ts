import AsyncStorage from "@react-native-community/async-storage";
import RNFetchBlob from "rn-fetch-blob";

export const CACHE_DIR = `${RNFetchBlob.fs.dirs.CacheDir}/cache`;
export class Cache implements ICache {
	constructor(callback: () => void) {
		this.loadCache(() => {
			callback();
		});

		// Cache saver
		setInterval(() => {
			AsyncStorage.setItem("cachedKeys", JSON.stringify(this.cachedKeys));
		}, 10000);

		this.clearOldCache();
	}

	public cachedKeys: Array<{ value: string; lastUsed: number; maxAge: number; type: "image" | "json" }> = [];
	public cacheInitilized = false;

	public loadCache(callback: () => void) {
		AsyncStorage.getItem("cachedKeys", async (err, res) => {
			if (err) return console.log(err);

			this.cachedKeys = JSON.parse(res);

			console.log("CCKEYs");
			console.log(this.cachedKeys);
			if (this.cachedKeys == null) {
				this.cachedKeys = [];
				AsyncStorage.setItem("cachedKeys", "[]");
			}

			console.log(await RNFetchBlob.fs.ls(`${CACHE_DIR}`));
			let exists = await RNFetchBlob.fs.exists(CACHE_DIR);
			if (!exists) RNFetchBlob.fs.mkdir(CACHE_DIR);
		});
	}

	public checkIfCached(key: string) {
		if (!this.cachedKeys) return false;

		return this.cachedKeys.find(({ value }) => key == value) !== undefined;
	}

	public async getCachedValue(key: string, callback: (error: any, value: string) => void) {
		if (this.checkIfCached(key)) {
			RNFetchBlob.fs.readFile(`${CACHE_DIR}/${key}`, "utf8").then((file) => {
				callback(null, file);
			});

			let i = this.cachedKeys.findIndex(({ value }) => value == key);
			this.cachedKeys[i].lastUsed = Math.floor(new Date().getTime() / 1000);
		} else {
			callback(new Error("Key is not cached"), null);
		}
	}

	public addToCache(key: string, maxAge: number, type: "image" | "json") {
		console.log("CTIME: " + Math.floor(new Date().getTime() / 1000.0));
		if (this.checkIfCached(key)) return;
		this.cachedKeys.push({ value: key, lastUsed: Math.floor(new Date().getTime() / 1000.0), maxAge, type });
	}

	public clearOldCache() {
		this.cachedKeys = this.cachedKeys.reduce((pv, cv) => {
			if (Math.floor(new Date().getTime() / 1000) - cv.maxAge > cv.lastUsed) {
				RNFetchBlob.fs.unlink(`${CACHE_DIR}/${cv.value}`);
				return pv;
			}
			return pv.concat(cv);
		}, []);
	}

	public clearFromCache(key: string) {}
}

export const MAX_AGE = {
	day: 86400,
	week: 604800,
	month: 2629743,
	year: 31556926,
};

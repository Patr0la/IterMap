import AsyncStorage from "@react-native-community/async-storage";

export class Cache {
	constructor(callback: () => void) {
		this.loadCache(() => {
			callback();
		});
	}

	public cachedKeys: Array<{ value: string; lastUsed: number }> = [];
	private cacheInitilized = false;

	public loadCache(callback: () => void) {
		AsyncStorage.getItem("cachedKeys", (err, res) => {
			if (err) return console.log(err);

			this.cachedKeys = JSON.parse(res);
		});
	}

	public checkIfCached(key: string) {
		return this.cachedKeys.find(({value}) => key == value) !== undefined;
	}

	public getCachedValue(key: string, callback: (error: any, value: string) => void) {
		if(this.checkIfCached(key)){

        }else{
            callback(new Error("Image is not cached"), null);
        }
	}

	public addToCache(key: string, value: string) {}

	public clearOldCache(minAge: string) {}

	public clearFromCache(key: string) {}
}

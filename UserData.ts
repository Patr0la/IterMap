import {} from "react-native";

import Geolocation from "react-native-geolocation-service";

import * as config from "./Config.json";

import AsyncStorage from "@react-native-community/async-storage";

import {Cache} from "./Cache"

export class UserData implements IUserData {
	private initilized = false;

    public online: boolean = true; //TODO on geolocation
    
    public cache: Cache;
    
	public initilize(callback: (success: boolean) => void, locationLoadedCallback: (sucess: boolean) => void): void {
		let keys = [];
		for (const v in DataKeys) {
			keys.push(v);
		}

		this.cache = new Cache(() => {
			console.log("Cache loaded")
		});

		AsyncStorage.multiGet(keys, (err, res) => {
			if (err) {
				callback(false);
				return;
			}

			res.forEach((v) => {
				if (DataKeysInJson.indexOf(v[0]) > -1) this[`_${v[0]}`] = JSON.parse(v[1]);
				else this[`_${v[0]}`] = v[1];
			});

			this.initilized = true;
			this.reftesh((s) => {
				callback(s);
			});
		});

		Geolocation.getCurrentPosition(
			(pos) => {
				fetch(`${config.host}/api/reverseGeoCode`, {
					method: "POST",
					headers: {
						Accept: "application/json",
						Cookie: `session=${this.token}`,
						"Content-Type": "application/json",
					},

					body: JSON.stringify({
						lat: pos.coords.latitude,
						lng: pos.coords.longitude,
					}),
				})
					.then((res) => res.json())
					.then(({ city, county, country }) => {
						this.lastLocation = { city, county, country, pos: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } };
						locationLoadedCallback(true);
					})
					.catch((err) => {
						console.log(err);
						callback(true);
					});
			},
			(err) => {
				console.log(err);
			},
			{ enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 },
		);
	}

	public reftesh(callback: (sucess: boolean) => void) {
		try {
			fetch(`${config.host}/api/myProfileInfo`, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Cookie: `session=${this.token}`,
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.then((data) => {
					if (!data.username) {
						this.token = "";
						callback(false);
					} else {
						//TODO sync

						this.username = data.username;

						this.myProfileInfo = {...data}

						callback(true);
					}
				})
				.catch((reason) => {
					console.log(reason);
					this.online = false;
					callback(true);
				});
		} catch (e) {
			this.online = false;
			callback(true);
		}
	}

	private postInitialization(callback: () => void) {}

	private _username: string;
	public get username(): string {
		return this._username;
	}
	public set username(v: string) {
		this._username = v;
		AsyncStorage.setItem(DataKeys.username, v, (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _token: string;
	public get token(): string {
		return this._token;
	}
	public set token(v: string) {
		this._token = v;
	}

	private _lastLocation: ILastLocation;
	public get lastLocation(): ILastLocation {
		return this._lastLocation;
	}
	public set lastLocation(v: ILastLocation) {
		this._lastLocation = v;
		AsyncStorage.setItem(DataKeys.lastLocation, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _lastPos: ILivePos;
	public get lastPos(): ILivePos {
		return this._lastPos;
	}
	public set lastPos(v: ILivePos) {
		this._lastPos = v;
	}

	private _myRoutes: Array<IRoute>;
	public get myRoutes(): Array<IRoute> {
		return this._myRoutes;
	}
	public set myRoutes(v: Array<IRoute>) {
		this._myRoutes = v;

		AsyncStorage.setItem(DataKeys.myRoutes, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _myProfileInfo: IProfileEntry;
	public get myProfileInfo(): IProfileEntry {
		return this._myProfileInfo;
	}
	public set myProfileInfo(v: IProfileEntry) {
		this._myProfileInfo = v;

		AsyncStorage.setItem(DataKeys.myProfileInfo, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _liveRoutesInCreation: Array<{ id: string; name: string; tracking: boolean }>;
	public get liveRoutesInCreation(): Array<{ id: string; name: string; tracking: boolean }> {
		return this._liveRoutesInCreation;
	}
	public set liveRoutesInCreation(v: Array<{ id: string; name: string; tracking: boolean }>) {
		this._liveRoutesInCreation = v;

		AsyncStorage.setItem(DataKeys.liveRoutesInCreation, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _liveRoutesTracking: Array<{ id: string; name: string; tracking: boolean }>;
	public get liveRoutesTracking(): Array<{ id: string; name: string; tracking: boolean }> {
		return this._liveRoutesTracking;
	}
	public set liveRoutesTracking(v: Array<{ id: string; name: string; tracking: boolean }>) {
		this._liveRoutesTracking = v;

		AsyncStorage.setItem(DataKeys.liveRoutesTracking, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _grid: boolean;
	public get grid(): boolean {
		return this._grid;
	}
	public set grid(v: boolean) {
		this._grid = v;

		AsyncStorage.setItem(DataKeys.grid, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _cameraFront: boolean;
	public get cameraFront(): boolean {
		return this._cameraFront;
	}
	public set cameraFront(v: boolean) {
		this._cameraFront = v;

		AsyncStorage.setItem(DataKeys.cameraFront, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _displayAngle: boolean;
	public get displayAngle(): boolean {
		return this._displayAngle;
	}
	public set displayAngle(v: boolean) {
		this._displayAngle = v;

		AsyncStorage.setItem(DataKeys.displayAngle, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _flash: boolean;
	public get flash(): boolean {
		return this._flash;
	}
	public set flash(v: boolean) {
		this._flash = v;

		AsyncStorage.setItem(DataKeys.flash, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _displayHeatMap: boolean;
	public get displayHeatMap(): boolean {
		return this._displayHeatMap;
	}
	public set displayHeatMap(v: boolean) {
		this._displayHeatMap = v;

		AsyncStorage.setItem(DataKeys.displayHeatMap, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _displayMarkers: boolean;
	public get displayMarkers(): boolean {
		return this._displayMarkers;
	}
	public set displayMarkers(v: boolean) {
		this._displayMarkers = v;

		AsyncStorage.setItem(DataKeys.displayMarkers, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _displayPath: boolean;
	public get displayPath(): boolean {
		return this._displayPath;
	}
	public set displayPath(v: boolean) {
		this._displayPath = v;

		AsyncStorage.setItem(DataKeys.displayPath, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}

	private _displaySatelite: boolean;
	public get displaySatelite(): boolean {
		return this._displaySatelite;
	}
	public set displaySatelite(v: boolean) {
		this._displaySatelite = v;

		AsyncStorage.setItem(DataKeys.displaySatelite, JSON.stringify(v), (err) => {
			err && console.log(err); // ERR handle
		});
	}
}

export enum DataKeys {
	token = "token",
	username = "username",
	lastLocation = "lastLocation",
	myProfileInfo = "myProfileInfo",
	myRoutes = "myRoutes",

	liveRoutesInCreation = "liveRoutesInCreation",
	liveRoutesTracking = "liveRoutesTracking",

	grid = "grid",
	cameraFront = "cameraFront",
	displayAngle = "displayAngle",
	flash = "flash",

	displayHeatMap = "displayHeatMap",
	displayMarkers = "displayMarkers",
	displayPath = "displayPath",
	displaySatelite = "displaySatelite",
}

const DataKeysInJson: Array<string> = [DataKeys.lastLocation, DataKeys.myProfileInfo, DataKeys.myRoutes, DataKeys.liveRoutesInCreation, DataKeys.liveRoutesTracking, DataKeys.grid, DataKeys.cameraFront, DataKeys.displayAngle, DataKeys.flash, DataKeys.displayHeatMap, DataKeys.displayMarkers, DataKeys.displayPath, DataKeys.displaySatelite];

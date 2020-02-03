interface IProps {
	navigation?: import("react-navigation-stack").NavigationStackProp | import("react-navigation-drawer").NavigationDrawerProp; //ScreenNavigation.IScreenNavigationData;

	data: IUserData;
}

interface IUserData {
	username: string;
	token: string;
	lastLocation: ILastLocation;
	lastPos: ILivePos;
	online: boolean;

	myRoutes: Array<IRoute>;
	myProfileInfo: IProfileEntry;
	liveRoutesInCreation: Array<{ id: string; name: string; tracking: boolean }>;
	liveRoutesTracking: Array<{ id: string; name: string; tracking: boolean }>;

	initilize(callback: () => void, locationCallback: () => void): void;

	cache: ICache;

	displayAngle: boolean;
	flash: boolean;
	cameraFront: boolean;
	grid: boolean;

	displayHeatMap: boolean;
	displayMarkers: boolean;
	displayPath: boolean;
	displaySatelite: boolean;
}

interface ICache {
	cachedKeys: Array<{ value: string; lastUsed: number; maxAge: number; type: "image" | "json" }>;
	cacheInitilized: boolean;
	loadCache: (callback: () => void) => void;
	getLastModified: (key: string, callback: (lastModified: number) => void) => void;
	checkIfCached: (key: string) => void;
	getCachedValue: (key: string, callback: (error: any, value: string) => void) => void;
	addToCache: (key: string, maxAge: number, type: "image" | "json") => void;
	clearOldCache: (minAge: string) => void;
	clearFromCache: (key: string) => void;
}

interface ILastLocation {
	city: string;
	county: string;
	country: string;
	pos: IPos;
}

interface IRoute {
	_id?: ObjectId & string;

	title?: string;
	description?: string;
	creator?: string;
	created?: number;

	isPublic?: boolean;

	score?: number;
	votes?: Array<IVote>;
	voted?: number;
	views?: number;
	uses?: number;

	travelTime?: number;
	cost?: ICost;

	days?: number;

	markers?: Array<IMarker>;
	path?: Array<Array<IPos>>;
	livePath?: Array<ILivePos>;
	traveledBy?: Array<travelVehicle>;

	lastMapPosition?: IPos;

	canEdit?: boolean;

	isLiveRoute? : boolean;
}

interface IVote {
	user: string;
	comment: string;
	mark: number;
}

interface ICityRoute extends IRoute {
	city: string;
}

interface ICountryRoute extends IRoute {
	cities: Array<string>;

	country: string;
}

interface IInternationalRoute extends IRoute {
	cities: Array<string>;
	countries: Array<string>;
}

type travelVehicle = "Plane" | "Ship" | "Bus" | "Car" | "Foot";

interface IMarker {
	id: string;

	isLogicMarker: boolean;
	logicFunction: "day" | "waypoint" | "location";

	pos: IPos;
	title?: string;
	pictures?: Array<string>;
	time: ITime;
	price: ICost;
	description: string;

	types: Array<string>;

	day: number;

	_markerOnMap?: any;
}

interface ITime {
	time: number;
	unit: "m" | "h" | "live";
}

interface ICost {
	value: number;
	currency: string;
}

interface IPos {
	longitude: number;
	latitude: number;
}

interface IProfileEntry {
	username?: string;

	routes?: Array<import("bson").ObjectID>;

	score?: number;
	joined?: number;

	description?: string;
	favoriteRoute?: IRoute;
}

interface ILiveRoute {
	localId?: string;

	name?: string;
	share?: boolean;
	latency?: number;
	latencyUnit?: "h" | "m";

	path?: Array<ILivePos>;

	markers?: Array<IMarker>;
}

interface ILivePos extends IPos {
	time: number;
	latitude: number;
	longitude: number;
	altitude: number;
	accuracy: number;
	speed: number;
}

interface IMarkerUpdateHandlers {
	setMarkerAtPosition: (marker: IMarker, position: number, important?: boolean) => void;

	addMarker: (marker: IMarker, important?: boolean) => void;
	addMarkerAtDay: (marker: IMarker, day: number, important?: boolean) => void;
	addMarkerAtPosition: (marker: IMarker, position: number, important?: boolean) => void;

	removeMarkerAtPosition: (position: number, important?: boolean) => void;

	moveMarkers: (s: number, i: number, e: number, important?: boolean) => void;
	switchMarkers: (i1: number, i2: number, important?: boolean) => void;

	onDaySelect: (day: number, important?: boolean) => void;
}

interface ObjectId {}

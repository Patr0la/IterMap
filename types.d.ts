interface IProps {
    navigation?: import("react-navigation-stack").NavigationStackProp | import("react-navigation-drawer").NavigationDrawerProp; //ScreenNavigation.IScreenNavigationData;

    data: IUserData;
}

interface IUserData {
    username: string;
    token: string;
    lastLocation: ILastLocation;
    lastPos: ILivePos;

    myRoutes: Array<IRoute>;
    myProfileInfo: IProfileEntry;
    liveRoutesInCreation: Array<{ id: string; name: string, tracking: boolean }>;
    liveRoutesTracking: Array<{ id: string; name: string, tracking: boolean }>;
    
    initilize(callback: () => void, locationCallback: () => void): void;

    displayAngle: boolean;
    flash: boolean;
    cameraFront: boolean;
    grid: boolean;
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
    creator?: string;
    created?: number;

    score?: number;
    votes?: Array<IVote>;
    views?: number;
    uses?: number;

    travelTime?: number;
    cost?: number;

    markers?: Array<IMarker>;
    path?: Array<IPos>;
    livePath?: Array<ILivePos>;
    traveledBy?: Array<travelVehicle>;

    lastMapPosition?: IPos;

    canEdit?: boolean;
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

    pos: IPos;
    title?: string;
    pictures?: Array<string>;
    time: string;
    price: ICost;
    description: string;

    types: Array<string>;

    _markerOnMap?: any;
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
}

interface ObjectId {}

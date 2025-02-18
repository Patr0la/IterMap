import BackgroundGeolocation, { Location } from "@mauron85/react-native-background-geolocation";
import AsyncStorage from "@react-native-community/async-storage";
import ViewPager from "@react-native-community/viewpager";
import React from "react";
import { Dimensions, PanResponderInstance, PermissionsAndroid, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Geolocation from "react-native-geolocation-service";
import { SearchBox } from "../Components/SearchBox";
import * as config from "../Config.json";
import { DataKeys } from "../UserData";
import { Camera } from "./Camera";
import { LiveRoute } from "./LiveRoute";
import { RoutesPreview } from "../Components/RoutesPreview";

interface Props extends IProps {}

interface State {
	viewing: "nearby" | "country" | "world";
	scrollEnabled: boolean;

	currentStepCount?: number;

	topRoutes: Array<IRoute>;
	topRoutesNextSkip: number;

	countryRoutes: Array<IRoute>;
	countryRoutesNextSkip: number;

	nerbyRoutes: Array<IRoute>;
	nerbyRoutesNextSkip: number;
}

export class Home extends React.Component<Props, State> {
	static navigationOptions = {
		drawerLabel: "Home",
		//drawerIcon: ({ tintColor }) => <Image style={[styles.icon, { tintColor: tintColor }]} />,
	};

	constructor(props: Props) {
		super(props);
		PermissionsAndroid.request("android.permission.ACCESS_FINE_LOCATION");
		PermissionsAndroid.request("android.permission.WRITE_EXTERNAL_STORAGE");
		PermissionsAndroid.request("android.permission.READ_EXTERNAL_STORAGE");
		PermissionsAndroid.request("android.permission.BODY_SENSORS");
		Geolocation.requestAuthorization();

		Geolocation.getCurrentPosition(
			(pos) => {
				fetch(`${config.host}/api/reverseGeoCode`, {
					method: "POST",
					headers: {
						Accept: "application/json",
						Cookie: `session=${this.props.data.token}`,
						"Content-Type": "application/json",
					},

					body: JSON.stringify({
						lat: pos.coords.latitude,
						lng: pos.coords.longitude,
					}),
				})
					.then((res) => res.json())
					.then(({ city, county, country }) => {
						this.props.data.lastLocation = { city, county, country, pos: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } };
					})
					.catch((err) => {
						console.log(err);
					});
			},
			(err) => {
				console.log(err);
			},
			{ enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 },
		);

		this.state = {
			viewing: "world",
			scrollEnabled: true,
			topRoutes: [],
			topRoutesNextSkip: 0,
			countryRoutes: [],
			countryRoutesNextSkip: 0,
			nerbyRoutes: [],
			nerbyRoutesNextSkip: 0,
		};

		this.loadTop();
		this.loadCountry();
		this.loadNerby();
	}

	loadTop(skip?: boolean) {
		fetch(`${config.host}/api/getTopRoutes?t=${new Date().getTime()}`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},

			body: JSON.stringify({
				skip: 0,
			}),
		})
			.then((res) => res.json())
			.then((topRoutes) => {
				this.setState({ topRoutes: topRoutes.reverse() }, () => this.RoutesPreview.forceUpdate());
			})
			.catch((err) => {
				console.log(err);
			});
	}

	loadCountry(skip?: boolean) {
		fetch(`${config.host}/api/getCountryRoutes?t=${new Date().getTime()}`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},

			body: JSON.stringify({
				skip: 0,
				country: this.props.data?.lastLocation?.country,
			}),
		})
			.then((res) => res.json())
			.then((countryRoutes) => {
				this.setState({ countryRoutes: countryRoutes.reverse()});
				console.log(countryRoutes);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	loadNerby(skip?: boolean) {
		fetch(`${config.host}/api/getNerbyRoutes?t=${new Date().getTime()}`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},

			body: JSON.stringify({
				skip: 0,
				pos: this.props.data.lastPos,
			}),
		})
			.then((res) => res.json())
			.then((nerbyRoutes) => {
				this.setState({ nerbyRoutes: nerbyRoutes.reverse() });
			})
			.catch((err) => {
				console.log(err);
			});
	}

	Searchbar: SearchBox;
	RoutesPreview: RoutesPreview;
	home() {
		return (
			<View>
				<SearchBox
					placeHolder={this.state.currentStepCount?.toString()} //"Search for routes"
					ref={(ref) => (this.Searchbar = ref)}
					endpoint="findRoutes"
					menu
					navigation={this.props.navigation}
					data={this.props.data}
					onSelectCallback={(selection) => {
						console.log(selection); // TODO Navigate to thism
					}}
				/>

				<View style={{ flexDirection: "row", justifyContent: "space-evenly", backgroundColor: "#242424"}}>
					{this.props.data && this.props.data.lastLocation && (
						<TouchableOpacity style={{ ...styles.button, ...(this.state.viewing == "nearby" ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}) }} onPress={() => this.setState({ viewing: "nearby" })}>
							<Text style={styles.buttonText}>Nearby</Text>
						</TouchableOpacity>
					)}
					{this.props.data && this.props.data.lastLocation && (
						<TouchableOpacity style={{ ...styles.button, ...(this.state.viewing == "country" ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}) }} onPress={() => this.setState({ viewing: "country" })}>
							<Text style={styles.buttonText}>{this.props.data.lastLocation.country}</Text>
						</TouchableOpacity>
					)}
					<TouchableOpacity style={{ ...styles.button, ...(this.state.viewing == "world" ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}) }} onPress={() => this.setState({ viewing: "world" })}>
						<Text style={styles.buttonText}>World</Text>
					</TouchableOpacity>
				</View>

				{!this.props.data.online && (
					<View style={{ alignItems: "center", justifyContent: "center", width: "100%", backgroundColor: "#242424" }}>
						<Text style={{ color: "white" }}>Offline</Text>
					</View>
				)}

				{this.state.viewing == "nearby" ? (
					<View>
						<RoutesPreview onRefresh={() => this.loadNerby()} routeData={this.state.nerbyRoutes} data={this.props.data} navigation={this.props.navigation}></RoutesPreview>
					</View>
				) : this.state.viewing == "country" ? (
					<View>
						<RoutesPreview onRefresh={() => this.loadCountry()}  routeData={this.state.countryRoutes} data={this.props.data} navigation={this.props.navigation}></RoutesPreview>
					</View>
				) : (
					<View>{this.state.topRoutes && <RoutesPreview onRefresh={() => this.loadTop()}  ref={(ref) => (this.RoutesPreview = ref)} routeData={this.state.topRoutes} data={this.props.data} navigation={this.props.navigation}></RoutesPreview>}</View>
				)}

				{/*<AdMobBanner
                    adSize="smartBannerPortrait"
                    bannerSize="smartBannerPortrait"
                    adUnitID="ca-app-pub-2152308991050720/3360133038"
                    //testDevices={[AdMobBanner.simulatorId]}
                    didFailToReceiveAdWithError={(err) => {
                        console.log(err)
                    }}
                    onAdLoaded={() => {
                        console.log("onAdLoaded");
                    }}
                    onAdFailedToLoad={(err) => {
                        console.log("onAdFailedToLoad");
                        console.log(err)
                    }}
                    onAdOpened={() => {
                        console.log("onAdOpened");
                    }}
                    onAdClosed={() => {
                        console.log("onAdClosed");
                    }}
                    onAdLeftApplication={() => {
                        console.log("onAdLeftApplication");
                    }}
                    onSizeChange={() => {
                        console.log("onSizeChange");
                    }}
                />*/}
			</View>
		);
	}

	_panResponder: PanResponderInstance;
	viewPager: ViewPager;
	render() {
		if (!this.props.data.liveRoutesTracking?.reduce((pv, { tracking }) => tracking || pv, false)) {
			StatusBar.setTranslucent(false);
			StatusBar.setBackgroundColor("#242424");
			return this.home();
		}

		StatusBar.setTranslucent(true);
		StatusBar.setBackgroundColor("#24242411");

		return (
			<ViewPager
				style={{ flex: 1 }}
				scrollEnabled={this.state.scrollEnabled}
				ref={(ref) => {
					this.viewPager = ref;
				}}
				onPageSelected={({ nativeEvent: { position } }) => {
					position == 0 ? this.props.navigation.setParams({ drawerLockMode: "unlocked" }) : this.props.navigation.setParams({ drawerLockMode: "locked-closed" });

					this.setState({ scrollEnabled: position != 2 });
				}}
				initialPage={1}
			>
				<View key={0} style={{ backgroundColor: "#242424", height: d.height, width: d.width, paddingTop: StatusBar.currentHeight }}>
					{this.home()}
				</View>

				<View key={1} style={{ backgroundColor: "#242424", height: d.height, width: d.width }}>
					<Camera data={this.props.data} navigation={this.props.navigation}></Camera>
				</View>

				<View key={2} style={{ backgroundColor: "#242424", height: d.height, width: d.width, paddingTop: StatusBar.currentHeight }}>
					<LiveRoute
						pageMove={() => {
							this.viewPager.setPage(1);
						}}
						id={this.props.data.liveRoutesTracking[0].id}
						data={this.props.data}
					></LiveRoute>
				</View>
			</ViewPager>
		);
	}

	componentDidMount() {
		// AsyncStorage.getItem(DataKeys.liveRoutesTracking, (err, res) => {
		//     let liveRoutes = JSON.parse(res) as Array<{ id: string; name: string; tracking: boolean }>;

		//     liveRoutes.forEach(({id}) => {
		//         AsyncStorage.getItem(`live_${id}`, (err, res) => {
		//             if (err) return console.log(err);
		//             if (!res) return;

		//             RNFetchBlob.fs.writeFile(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${(new Date).getTime()}.json`, res);
		//         });
		//     })
		// });

		BackgroundGeolocation.configure({
			desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
			stationaryRadius: 10,
			distanceFilter: 10,
			notificationTitle: "Iter - route tracking",
			notificationText: "Tracking enabled",
			notificationsEnabled: true,
			debug: false,
			stopOnTerminate: false,
			locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
			interval: 10000,
			fastestInterval: 5000,
			activitiesInterval: 10000,
			stopOnStillActivity: false,
			startOnBoot: false,
			startForeground: true,
		});

		BackgroundGeolocation.on("start", () => {
			console.log("GEOLOCATION RUNNING");
		});

		BackgroundGeolocation.on("error", (err) => {
			console.log("ERR: " + err.message);
		});

		BackgroundGeolocation.on("location", (location) => {
			procesPoint(location, this.props.data);
			//{accuracy, latitude, longitude, altitude, time}
		});

		BackgroundGeolocation.on("abort_requested", () => {
			console.log("abort_requested");
		});

		BackgroundGeolocation.on("stop", () => {
			console.log("GEOLOCATION STOPPED");
		});

		BackgroundGeolocation.on("stationary", (location) => {
			console.log(location);
		});

		BackgroundGeolocation.on("authorization", (s) => {
			console.log("authotization: " + s);

			if (s != BackgroundGeolocation.AUTHORIZED) {
				setTimeout(() => {
					BackgroundGeolocation.showAppSettings();
				}, 1000);
			}
		});

		BackgroundGeolocation.checkStatus((status) => {
			console.log(status);
			if (!status.isRunning) {
				BackgroundGeolocation.start();
				BackgroundGeolocation.headlessTask(async (event) => {
					if (event.name == "location" || event.name == "stationary") procesPoint(event.params, this.props.data);
				});
			} else if (this.props.data?.liveRoutesTracking?.length) {
				BackgroundGeolocation.start();
			}
		});
	}

	componentWillUnmount() {
		BackgroundGeolocation.removeAllListeners();
		AsyncStorage.getItem(DataKeys.liveRoutesTracking, (err, res) => {
			let liveRoutes = JSON.parse(res) as Array<{ id: string; name: string; tracking: boolean }>;
			if (!err && ((res && (liveRoutes.length == 0 || !liveRoutes.reduce((pv, { tracking }) => pv || tracking, false))) || !res)) {
				BackgroundGeolocation.stop();
			}
		});
	}
}

var lastPoints = [];
function procesPoint(point: Location, data: IUserData) {
	let { accuracy, longitude, latitude, altitude, time, speed } = point;
	data.lastPos = { accuracy, longitude, latitude, altitude, time, speed };

	// console.log(data.lastPos)

	// return false;

	if (lastPoints.length > 20) {
		lastPoints.shift();
		lastPoints.push();
	} else lastPoints.push();

	// let latitude = parseFloat(point.latitude.toFixed(5));
	// let longitude = parseFloat(point.longitude.toFixed(5));

	AsyncStorage.getItem(DataKeys.liveRoutesTracking, (err, res) => {
		if (err) return console.log(err);
		let liveRoutesTracking = JSON.parse(res);

		console.log(`${latitude} : ${longitude} :: ${point.accuracy} : ${point.speed}`);
		if (liveRoutesTracking && liveRoutesTracking.length > 0) {
			liveRoutesTracking.forEach(({ id }) => {
				AsyncStorage.getItem(`live_${id}`, (err, res) => {
					if (err) return console.log(err);
					if (!res) return;

					let r: ILiveRoute = JSON.parse(res);
					r.path.push({
						accuracy,
						latitude,
						longitude,
						altitude,
						time,
						speed,
					});

					AsyncStorage.setItem(`live_${id}`, JSON.stringify(r), (err) => {
						if (err) console.log(err);
					});
				});
			});
		} else {
			BackgroundGeolocation.stop();
		}
	});
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#242424",
		color: "white",
		justifyContent: "center",
		borderBottomWidth: 4,
		borderBottomColor: "#242424",
	},
	buttonText: {
		width: d.width / 3,
		fontSize: 16,
		lineHeight: 16,
		height: 44,
		color: "white",
		textAlignVertical: "center",
		textAlign: "center",
		fontWeight: "bold",
	},
});

import AsyncStorage from "@react-native-community/async-storage";
import CameraRoll from "@react-native-community/cameraroll";
import React from "react";
import { Button, Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import MapView, { Circle, Heatmap, Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Share from "react-native-share";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFetchBlob from "rn-fetch-blob";
import { PageNavigator } from "../Components/PageNavigator";
import { MapStyle } from "../MapStyle";
import { DataKeys } from "../UserData";

interface Props extends IProps {
	navigatedTo?: boolean;
	id?: string;
	ids?: Array<string>;
	pageMove?: () => void;
}

interface State extends ILiveRoute {
	viewing: "back" | "route" | "stats" | "gallery";
	id?: string;

	selectingPictures: boolean;
	selectedPictures: Array<string>;

	displayHeatMap: boolean;
	displayMarkers: boolean;
	displayPath: boolean;
	displaySatelite: boolean;

	displayOptions: boolean;
}

export class LiveRoute extends React.Component<Props, State> {
	static navigationOptions = {
		drawerLabel: "Home",
		//drawerIcon: ({ tintColor }) => <Image style={[styles.icon, { tintColor: tintColor }]} />,
	};

	constructor(props: Props) {
		super(props);

		this.state = {
			viewing: "route",

			selectingPictures: false,
			selectedPictures: [],

			displayHeatMap: props.data.displayHeatMap,
			displayMarkers: props.data.displayMarkers,
			displayPath: props.data.displayPath,
			displaySatelite: props.data.displaySatelite,

			displayOptions: false,
		};
	}

	calculateRoutePoints(route: ILiveRoute): { path: any; markers: Array<IMarker> } {
		let lastPoints = [];
		let newPath = [];
		let places = [];

		if(!route.path) return {path: [], markers: []};
		route.path.forEach((point) => processPoint(point, lastPoints, places, newPath));

		console.log("Calculate root points");

		let newMarkers: Array<IMarker> = [
			...(route.markers ? route.markers : []),
			...places.map(({ latitude, longitude, time }) => ({
				pos: { latitude, longitude },
				isLogicMarker: true,
				logicFunction: "location" as const,
				time,
				price: { value: 0, currency: "" },
				description: "",
				types: [],
				id: `${latitude},${longitude}`,
				day: 0, // TODO calculate dateđ
			})),
		];

		return {
			path: newPath,
			markers: newMarkers,
		};
	}

	MapView: MapView;
	lastUpdateTime: number = 0;
	pageNavigator: PageNavigator;
	render() {
		if (this.props.navigatedTo) {
			let id: string = this.props.navigation.getParam("id", undefined);
			let cTime = new Date().getTime();
			if ((id && id != this.state.localId) || cTime - 10000 > this.lastUpdateTime) {
				AsyncStorage.getItem(`live_${id}`, (err, res) => {
					if (err) console.error(err);

					let route: ILiveRoute = JSON.parse(res);
					let { markers, path } = this.calculateRoutePoints(route);
					route.markers = markers;
					route.path = path;

					this.setState({ ...route });

					this.lastUpdateTime = cTime;
				});
			}
		} else {
			let cTime = new Date().getTime();
			if (cTime - 10000 > this.lastUpdateTime) {
				AsyncStorage.getItem(`live_${this.props.id}`, (err, res) => {
					if (err) console.error(err);

					let route: ILiveRoute = JSON.parse(res);
					let { markers, path } = this.calculateRoutePoints(route);
					route.markers = markers;
					route.path = path;

					this.setState({ ...route });

					this.lastUpdateTime = cTime;
				});
			}
		}

		return (
			<View style={{ backgroundColor: "white" }}>
				<View></View>
				<PageNavigator
					ref={(ref) => (this.pageNavigator = ref)}
					default="route"
					routes={[
						{
							title: <Icon name="arrow-left" size={26} color="white" style={{ alignSelf: "center" }} />,
							value: "back",
						},
						{
							title: "Route",
							value: "route",
						},
						// {
						// 	title: "Stats",
						// 	value: "stats",
						// },
						{
							title: "Gallery",
							value: "gallery",
						},
					]}
					onSelectionChange={(viewing) => {
						if (viewing == "back") {
							this.pageNavigator.setState({ viewing: this.state.viewing });
							this.props.pageMove();
						} else this.setState({ viewing });
					}}
				/>

				{this.state.viewing == "route" ? (
					<View style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "space-between", padding: d.width * 0.05, paddingBottom: d.width * 0.05 * d.scale }}>
						<MapView
							cacheEnabled
							onPoiClick={(e) => {
								// this.setState({
								// 	markers: [
								// 		...this.state.markers,
								// 		{
								// 			pictures: [],
								// 			pos: e.nativeEvent.coordinate,
								// 			title: e.nativeEvent.name,
								// 			description: "",
								// 			price: { currency: "€", value: 0 },
								// 			time: "",
								// 			id: e.nativeEvent.placeId,
								// 			types: [],
								// 			day: 0,
								// 		},
								// 	],
								// });
							}}
							ref={(ref) => (this.MapView = ref)}
							//onLayout={() => this.props.onMapLayout()}
							style={{ ...StyleSheet.absoluteFillObject }}
							mapType={this.state.displaySatelite ? "satellite" : "standard"}
							customMapStyle={MapStyle}
							provider={PROVIDER_GOOGLE}
							initialRegion={{
								latitude: this.props.data.lastPos?.latitude || 0,
								longitude: this.props.data.lastPos?.longitude || 0,
								latitudeDelta: 0.04,
								longitudeDelta: 0.02,
							}}
							onPress={(e) => {
								console.log(e);
							}}
							onMarkerPress={(e) => {
								console.log(e);
							}}
							onLayout={(e) => this.state.path?.length && this.MapView.fitToCoordinates(this.state.path, { animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } })}
						>
							{this.state.displayPath && this.state.path?.length > 1 && <Polyline coordinates={this.state.path} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}
							{console.log(this.state.markers?.length)}

							{this.state.displayMarkers &&
								this.state.markers?.map(
									(m, i) =>
										m.pos && (
											<Marker draggable coordinate={m.pos} key={i}>
												<View style={{ width: 56, height: 56 }}>
													<Icon name="map-marker" size={56} style={{ position: "absolute" /*marginTop: 5*/ }} color="#242424" />
													{m.pictures && m.pictures[0] && <Image source={{ uri: `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${m.pictures[0]}` }} style={{ width: 32, height: 32, marginLeft: 12, marginTop: 6, borderRadius: 22 }}></Image>}
												</View>
											</Marker>
										),
								)}

							{false && this.state.path && this.state.path.map(({ latitude, longitude }) => <Circle center={{ latitude, longitude }} radius={2} fillColor="#242424"></Circle>)}
							{this.props.data.lastPos && <Circle center={this.props.data.lastPos} radius={10} strokeColor="#ad0a4c" strokeWidth={2} fillColor="#ad0a4c" zIndex={99999999999}></Circle>}
							{this.props.data.lastPos && <Circle center={this.props.data.lastPos} radius={40} strokeColor="#ad0a4c00" strokeWidth={3} fillColor="#ad0a4c22" zIndex={99999999999}></Circle>}

							{this.state.displayHeatMap && this.state.path && <Heatmap points={this.state.path} gradient={{ colors: ["#f4f49f", "#ad0a4c"], startPoints: [0.2, 0.8], colorMapSize: 256 }} />}
						</MapView>

						<View style={{ flexDirection: "column", alignSelf: "flex-end", justifyContent: "center", alignItems: "center", ...(this.state.displayOptions ? { backgroundColor: "white", borderRadius: 5, elevation: 5 } : {}) }}>
							<TouchableOpacity
								style={{ ...(!this.state.displayOptions ? { backgroundColor: "white", elevation: 5, borderRadius: 22 } : {}) }}
								onPress={() => {
									this.setState({ displayOptions: !this.state.displayOptions });
								}}
							>
								{this.state.displayOptions ? <Icon name="chevron-down" size={30} color="#242424" /> : <Icon name="chevron-up" size={30} color="#242424" />}
							</TouchableOpacity>

							{this.state.displayOptions && (
								<View style={{ flexDirection: "column", alignSelf: "flex-end", justifyContent: "flex-end" }}>
									<TouchableOpacity
										style={{ alignItems: "center", margin: 5 }}
										onPress={() => {
											this.props.data.displaySatelite = !this.props.data.displaySatelite;
											this.setState({ displaySatelite: !this.state.displaySatelite });
										}}
									>
										{this.state.displaySatelite ? <Icon name="satellite-variant" size={22} color="#242424" /> : <Icon name="map" size={22} color="#242424" />}
									</TouchableOpacity>

									<TouchableOpacity
										style={{ alignItems: "center", margin: 5 }}
										onPress={() => {
											this.props.data.displayPath = !this.props.data.displayPath;
											this.setState({ displayPath: !this.state.displayPath });
										}}
									>
										{this.state.displayPath ? <Icon name="chart-line-variant" size={22} color="#242424" /> : <Icon name="vector-polyline-remove" size={22} color="#242424" />}
									</TouchableOpacity>

									<TouchableOpacity
										style={{ alignItems: "center", margin: 5 }}
										onPress={() => {
											this.props.data.displayHeatMap = !this.props.data.displayHeatMap;
											this.setState({ displayHeatMap: !this.state.displayHeatMap });
										}}
									>
										{this.state.displayHeatMap ? <Icon name="blur" size={30} color="#242424" /> : <Icon name="blur-off" size={30} color="#242424" />}
									</TouchableOpacity>

									<TouchableOpacity
										style={{ alignItems: "center", margin: 5, marginBottom: 10 }}
										onPress={() => {
											this.props.data.displayMarkers = !this.props.data.displayMarkers;
											this.setState({ displayMarkers: !this.state.displayMarkers });
										}}
									>
										{this.state.displayMarkers ? <Icon name="map-marker" size={22} color="#242424" /> : <Icon name="map-marker-off" size={22} color="#242424" />}
									</TouchableOpacity>
								</View>
							)}
						</View>
						<TouchableOpacity
							style={{ width: 58, height: 58, borderRadius: 50, backgroundColor: "white", elevation: 5, justifyContent: "center", alignItems: "center", alignSelf: "flex-end" }}
							onPress={() => {
								this.MapView.setCamera({ center: this.props.data.lastPos, zoom: 16 });
							}}
						>
							<Icon name="crosshairs-gps" size={32} color="#ad0a4c" />
						</TouchableOpacity>
					</View>
				) : this.state.viewing == "stats" ? (
					<View style={{ backgroundColor: "white", width: "100%", height: "100%" }}>
						<Button
							title="EXPORT JSON"
							onPress={() => {
								AsyncStorage.getItem(DataKeys.liveRoutesTracking, (err, res) => {
									let liveRoutes = JSON.parse(res) as Array<{ id: string; name: string; tracking: boolean }>;

									liveRoutes.forEach(({ id }) => {
										AsyncStorage.getItem(`live_${id}`, (err, res) => {
											if (err) return console.log(err);
											if (!res) return;

											let filename = `${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${id}_${new Date().getTime()}.json`;
											RNFetchBlob.fs.writeFile(filename, res);

											// alert("exported to: " + filename);
										});
									});
								});
							}}
						></Button>
						<Text>{JSON.stringify(this.state)}</Text>
					</View>
				) : (
					<ScrollView style={{ flexDirection: "row", flexWrap: "wrap", backgroundColor: "white", width: "100%", height: "100%" }} contentContainerStyle={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap" }}>
						{(() => {
							let images = this.state.markers
								.reduce((pv, marker, markeri) => [...(marker?.pictures ? marker.pictures.map((p) => ({ id: marker.id, photo: p, types: marker.types })) : []), ...pv], [])
								.sort((a, b) => (a.photo < b.photo ? 1 : a.photo > b.photo ? -1 : 0))
								.map(({ id, photo, types }, ci) => (
									<TouchableOpacity
										key={`${id}/${photo}`}
										delayLongPress={250}
										onLongPress={() => {
											console.log("LONG PRESS!");
											this.setState({ selectingPictures: true, selectedPictures: [...this.state.selectedPictures, `${id}/${photo}`] });
										}}
										activeOpacity={1}
										onPress={() => {
											if (!this.state.selectingPictures) return;

											let i = this.state.selectedPictures.indexOf(`${id}/${photo}`);
											if (i > -1) {
												let selectedPictures = [...this.state.selectedPictures.slice(0, i), ...this.state.selectedPictures.slice(i + 1)];
												this.setState({ selectedPictures, selectingPictures: selectedPictures.length > 0 });
											} else this.setState({ selectedPictures: [...this.state.selectedPictures, `${id}/${photo}`] });
										}}
									>
										<ImageBackground key={`${id}/${photo}_bckg`} source={{ uri: `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${photo}` }} style={{ width: d.width * 0.245, height: d.width * 0.245, margin: d.width * 0.002 }}>
											<View style={{ alignItems: "flex-start", justifyContent: this.state.selectingPictures && (id == "unknown" || id.split("_")[0] == "unknown" || !types || types?.length == 0) ? "space-between" : "flex-end", paddingBottom: d.width * 0.002, marginTop: ci < 5 ? 0 : d.width * 0.002, width: "100%", height: "100%", backgroundColor: this.state.selectedPictures.indexOf(`${id}/${photo}`) > -1 ? "#ad0a4c55" : "#00000000" }}>
												{(id == "unknown" || id.split("_")[0] == "unknown" || !types || types?.length == 0) && <Icon name="map-marker-plus" size={16} color="#ad0a4c" />}
												{this.state.selectedPictures.indexOf(`${id}/${photo}`) > -1 ? <Icon name="checkbox-marked" size={20} color="#ad0a4c" style={{ alignSelf: "flex-end" }} /> : this.state.selectingPictures ? <Icon name="checkbox-blank-outline" size={20} color="#ad0a4c" style={{ alignSelf: "flex-end" }} /> : null}
											</View>
										</ImageBackground>
									</TouchableOpacity>
								))
								.reduce((pv, cv, ci, arr) => (pv.length < arr.length ? arr.slice().concat(Array(4 - (arr.length % 4)).fill(<View style={{ width: d.width * 0.25, height: d.width * 0.25 }}></View>)) : pv), []);
							return images;
						})()}
						<View style={{ height: d.height * 0.3, width: d.width }}></View>
					</ScrollView>
				)}

				{this.state.selectingPictures && (
					<View style={{ width: d.width, backgroundColor: "white", flexDirection: "row", justifyContent: "space-evenly", height: 85, position: "absolute", top: d.height - 80, alignItems: "flex-start" }}>
						<TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }} onPress={() => {}}>
							<Icon name="map-marker" size={28} color="#242424" />
							<Text>Geo tag</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
							onPress={async () => {
								this.state.selectedPictures.map((pic) => console.log);
								console.log(this.state.selectedPictures.map((pic) => `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`));

								let files = await Promise.all(this.state.selectedPictures.map((pic) => RNFetchBlob.fs.readFile(`file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`, "base64")));

								console.log(files);

								Share.open({ urls: files.map((file: string) => `data:image/png;base64,${file}`) })
									.then((res) => {
										console.log(res);
									})
									.catch((err) => {
										err && console.log(err);
									});
							}}
						>
							<Icon name="share-variant" size={28} color="#242424" />
							<Text>Share</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
							onPress={() => {
								let files = this.state.selectedPictures.map((pic) => `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`);
								CameraRoll.deletePhotos(files);
								files.map((file) => RNFetchBlob.fs.unlink(file));

								let newMarkers = [];
								this.state.markers.forEach((marker) => {
									this.state.selectedPictures.forEach((pic) => {
										let i = marker.pictures.indexOf(pic.split("/")[1]);
										if (i > -1) marker.pictures = [...marker.pictures.slice(0, i), ...marker.pictures.slice(i + 1)];
									});

									if (marker.pictures.length > 0) newMarkers.push(marker);
								});

								this.props.data.liveRoutesTracking.forEach(({ id, tracking }) => {
									if (tracking) {
										AsyncStorage.getItem(`live_${id}`, (err, res) => {
											let liveRoute: ILiveRoute = JSON.parse(res);

											liveRoute.markers = newMarkers;

											AsyncStorage.setItem(`live_${id}`, JSON.stringify(liveRoute), (error) => {
												error && console.log(error);
											});
										});
									}
								});

								this.setState({ markers: newMarkers });
							}}
						>
							<Icon name="delete" size={28} color="#242424" />
							<Text>Delete</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
							onPress={() => {
								this.setState({ selectedPictures: [], selectingPictures: false });
							}}
						>
							<Icon name="close" size={28} color="#242424" />
							<Text>Cancle</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	}
}

function processPoint(point, lastPoints: Array<IPos>, places, newPoints) {
	let { accuracy, latitude, longitude, altitude, time } = point;

	let { aLat, aLon, distanceTraveled } = lastPoints.reduce((pv, { latitude, longitude }) => ({ aLat: pv.aLat + latitude, aLon: pv.aLon + longitude, distanceTraveled: pv.distanceTraveled + (pv.lastLat != 0 && pv.lastLon != 0 ? CalculateDistance(pv.lastLat, pv.lastLon, latitude, longitude) : 0), lastLat: latitude, lastLon: longitude }), { aLat: 0, aLon: 0, distanceTraveled: 0, lastLat: 0, lastLon: 0 });
	aLat /= lastPoints.length;
	aLon /= lastPoints.length;

	// console.log(distanceTraveled)
	let d = CalculateDistance(latitude, longitude, aLat, aLon);

	if (d < 100 && distanceTraveled < 300) {
		if (places.length == 0 || !places.reduce((pv, cv) => pv || (cv.latitude && cv.longitude && CalculateDistance(cv.latitude, cv.longitude, aLat, aLon) < 100), false)) {
			console.log(distanceTraveled);
			places.push({ latitude: aLat, longitude: aLon });
			newPoints.push({ latitude: aLat, longitude: aLon, place: true });
		}
	} else {
		// if(d < 1500)
		newPoints.push({ latitude, longitude, place: false });
	}

	if (lastPoints.length > 50) {
		lastPoints.shift();
		lastPoints.push({ latitude, longitude });
	} else {
		lastPoints.push({ latitude, longitude });
	}
}

function CalculateDistance(lat1, lon1, lat2, lon2) {
	(lat1 == 0 || lon1 == 0) && console.log("reee");
	let R = 6371000;
	let dLat = deg2rad(lat2 - lat1);
	let dLon = deg2rad(lon2 - lon1);

	let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	let c = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return c * R;
}

function deg2rad(deg) {
	return (deg * Math.PI) / 180;
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

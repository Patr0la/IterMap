import React from "react";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import * as config from "../Config.json";
import { View, ImageBackground, Text, StyleSheet, Dimensions, StatusBar, Image, KeyboardAvoidingView, Keyboard } from "react-native";
import { TouchableOpacity, TextInput, ScrollView } from "react-native-gesture-handler";

import Carousel from "react-native-snap-carousel";

import { TypeToIcon } from "../Components/SearchBox";
import RNFetchBlob from "rn-fetch-blob";

import { SearchablePicker } from "../Components/SearchablePicker";
import AsyncStorage from "@react-native-community/async-storage";

import CameraRoll from "@react-native-community/cameraroll";

interface Props extends IProps {}

interface State {
	imageData?: string;
	timeTaken?: number;
	flash?: boolean;
	front?: boolean;
	location?: IPos;

	uploadNow?: boolean;

	places: Array<IPlaceNerby>;

	currentPage: number;

	selectingPlace: boolean;
	selectedPlace?: string | { name: string; type: string };
	selectedPlacePos?: IPos;

	keyboardOpen: boolean;

	customName: string;
	customTypeOpen: boolean;
	customType: string;

	posTaken?: ILivePos;
}

export class ImageTaken extends React.Component<Props, State> {
	constructor(props) {
		super(props);

		this.state = {
			selectingPlace: false,
			places: [],

			currentPage: 0,
			keyboardOpen: false,

			customName: "",
			customType: "",
			customTypeOpen: false,
		};
	}

	customTextInput: TextInput;

	render() {
		const imageData = this.props.navigation.getParam("imageData", "none");
		const location = this.props.navigation.getParam("location", "none");
		if (imageData != this.state.imageData) {
			// TODO rest of props
			this.setState({ imageData, location, timeTaken: new Date().getTime(), posTaken: { latitude: this.props.data.lastPos.latitude, longitude: this.props.data.lastPos.longitude, time: this.props.data.lastPos.time, accuracy: this.props.data.lastPos.accuracy, altitude: this.props.data.lastPos.altitude, speed: this.props.data.lastPos.speed } });
			console.log("REEEEE1111");
			fetch(`${config.host}/api/findPlacesNear`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					Cookie: `session=${this.props.data.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					lat: location.lat,
					lng: location.lng,
				}),
			})
				.catch((err) => {
					console.log(err);

					let places: Array<IPlaceNerby> = [];

					let ids = [];
					this.props.data.liveRoutesTracking.forEach(({ id, tracking }) => {
						if (tracking) ids.push(`live_${id}`);
					});

					AsyncStorage.multiGet(ids, (errors, res) => {
						res.forEach((v) => {
							let route: ILiveRoute = JSON.parse(v[1]);

							route.markers.forEach((marker) => {
								if (places.reduce((pv, cv, ci) => (cv.id == marker.id ? ci : pv), -1) == -1) {
									places.push({
										name: marker.title,
										id: marker.id,
										types: marker.types,
										photo: `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${marker.pictures[0]}`,
										distance: this.state.posTaken && marker.pos ? CalculateDistance(this.state.posTaken.latitude, this.state.posTaken.longitude, marker.pos.latitude, marker.pos.longitude) : 25,
										pos: marker.pos,
									});
								}
							});

							console.log(route.markers);
							console.log(places);
						});

						//@ts-ignore
						places.push({ id: "custom" });

						this.setState({ places });
					});
				})
				.then((res) => (res as Response).json())
				.then((placess) => {
					let places: Array<IPlaceNerby> = placess.map((place) => ({
						name: place.name,
						id: place.id,
						types: place.types,
						photo: place.photo ? `https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyDmYhpLaw_znrqhOtnqkQ4CcWFwL6xqjCM&photoreference=${place.photo}&maxheight=${1600}` : null,
						distance: place.distance,
						pos: place.pos,
					}));

					let ids = [];
					this.props.data.liveRoutesTracking.forEach(({ id, tracking }) => {
						if (tracking) ids.push(`live_${id}`);
					});

					AsyncStorage.multiGet(ids, (errors, res) => {
						res.forEach((v) => {
							let route: ILiveRoute = JSON.parse(v[1]);

							route.markers.map((marker) => {
								if (places.reduce((pv, cv, ci) => (cv.id == marker.id ? ci : pv), -1) == -1) {
									places.push({
										name: marker.title,
										id: marker.id,
										types: marker.types,
										photo: `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${marker.pictures[0]}`,
										distance: this.state.posTaken && marker.pos ? CalculateDistance(this.state.posTaken.latitude, this.state.posTaken.longitude, marker.pos.latitude, marker.pos.longitude) : 25,
										pos: marker.pos,
									});
								}
							});
						});

						//@ts-ignore
						places.push({ id: "custom" });

						this.setState({ places });
					});
				});
		}

		if (this.state.imageData)
			return (
				<ImageBackground
					source={{ uri: `data:image/png;base64,${this.state.imageData}` }}
					style={{
						width: "100%",
						height: "100%",
					}}
				>
					{!this.state.selectingPlace && (
						<View
							style={{
								flexDirection: "column",
								justifyContent: "space-between",
								...StyleSheet.absoluteFillObject,
							}}
						>
							<View style={styles.row}>
								<Icon name="close" size={33} color="white" onPress={() => this.props.navigation.navigate("Home")} />
								{this.state.uploadNow ? <Icon name="cloud-upload" size={42} color="white" onPress={() => this.setState({ uploadNow: !this.state.uploadNow })} /> : <Icon name="cloud-off-outline" size={42} color="white" onPress={() => this.setState({ uploadNow: !this.state.uploadNow })} />}
							</View>
							<View style={styles.row}>
								<TouchableOpacity onPress={() => this.setState({ selectingPlace: true })}>
									<Icon name="map-marker" size={42} color="white" />
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										let writeTime = new Date().getTime();

										RNFetchBlob.fs.exists(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter`).then((exists) => {
											if (exists)
												RNFetchBlob.fs.writeFile(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${writeTime}.jpg`, imageData, "base64").then((value) => {
													console.log(value);

													CameraRoll.save(`file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${writeTime}.jpg`, {
														album: "Iter",
														type: "photo",
													});
												});
											else
												RNFetchBlob.fs.mkdir(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter`).then(() => {
													RNFetchBlob.fs.writeFile(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${writeTime}.jpg`, imageData, "base64").then((value) => {
														console.log(value);
													});
												});
										});

										this.props.data.liveRoutesTracking.forEach(({ id, tracking }) => {
											if (tracking) {
												AsyncStorage.getItem(`live_${id}`, (err, res) => {
													if (err) console.log(err);

													let route: ILiveRoute = JSON.parse(res);

													if (!route.markers) route.markers = [];

													if (typeof this.state.selectedPlace == "string") {
														let i = route.markers.reduce((pv, { id }, ci) => (id == this.state.selectedPlace ? ci : pv), -1);

														if (i == -1) {
															route.markers.push({
																id: this.state.selectedPlace,
																isLogicMarker: false,
                                                                logicFunction: "location",
                                                                day: -1,
																description: "",
																pos: this.state.selectedPlacePos,
																price: { value: 0, currency: "?" },
																time: this.state.timeTaken.toString(),
																pictures: [`${writeTime}.jpg`],
																title: this.state.customName,
																types: [this.state.customType],
															});
														} else {
															route.markers[i].pictures.push(`${writeTime}.jpg`);
														}
													} else if (typeof this.state.selectedPlace == "object") {
														route.markers.push({
															id: `custom_${writeTime}`,
															isLogicMarker: false,
                                                            logicFunction: "location",
                                                            day: -1,
															description: "",
															pos: this.state.selectedPlacePos,
															price: { value: 0, currency: "?" },
															time: this.state.timeTaken.toString(),
															pictures: [`${writeTime}.jpg`],
															title: this.state.customName,
															types: [this.state.customType],
														});
													} else {
														route.markers.push({
															isLogicMarker: false,
                                                            logicFunction: "location",
                                                            day: -1,
															id: `unknown_${new Date().getTime()}`,
															description: "",
															pos: this.state.posTaken,
															price: { value: 0, currency: "?" },
															time: this.state.timeTaken.toString(),
															pictures: [`${writeTime}.jpg`],
															title: `Unknown ${(() => {
																let custsomIds = [];
																route.markers.reduce((pv, marker) => (marker.id.split("_")[0] == "unknown" ? pv + 1 : pv), 0);

																let total = 0;

																return total > 0 ? total + 1 : "";
															})()}`,
															types: ["unkown"],
														});
													}

													AsyncStorage.setItem(`live_${id}`, JSON.stringify(route), (error) => {
														error && console.log(error);
													});
												});
											}
										});

										this.props.navigation.navigate("Home");
									}}
								>
									<Icon name="download" size={42} color="white" />
								</TouchableOpacity>
							</View>
						</View>
					)}

					<View style={{ width: d.width, height: d.height, flexDirection: this.state.keyboardOpen ? "column-reverse" : "column", justifyContent: "flex-end", display: this.state.selectingPlace ? "flex" : "none" }}>
						{/*<View style={{height: d.height * 0.8, backgroundColor: "red"}}></View>*/}
						<TouchableOpacity
							style={{ height: "100%" }}
							onPress={() => {
								if (this.state.keyboardOpen) {
									Keyboard.dismiss();

									this.setState({ keyboardOpen: false });
								} else this.setState({ selectingPlace: false });
							}}
						></TouchableOpacity>
						<View style={{ marginBottom: "5%" }}>
							<Carousel
								keyboardShouldPersistTaps="always"
								data={this.state.places}
								renderItem={({ item: { id, name, photo, types, distance, pos } }) => {
									if (id == "custom")
										return (
											<View>
												<View key={id} style={{ width: d.width * 0.8, height: this.state.customTypeOpen ? "100%" : d.height * 0.3, flexDirection: "row", alignItems: "center" }}>
													<View style={{ backgroundColor: "white", width: "100%", height: this.state.customTypeOpen ? "70%" : d.height * 0.15, flexDirection: "column", flex: 1, marginRight: "5%", elevation: 5, justifyContent: "space-around", padding: "4%", marginTop: this.state.customTypeOpen ? 0 : 0 }}>
														<ScrollView keyboardShouldPersistTaps={"always"} keyboardDismissMode="on-drag" scrollEnabled={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
															<View style={{ flexDirection: "row", flex: 1, alignItems: "center", elevation: 5, marginRight: "5%" }}>
																<TextInput blurOnSubmit={false} ref={(ref) => (this.customTextInput = ref)} style={{ flex: 1, height: d.height * 0.1, fontSize: 16, padding: "0%" }} onFocus={() => this.setState({ keyboardOpen: true })} onBlur={() => this.setState({ keyboardOpen: false })} placeholder="Custom place" value={this.state.customName} onChangeText={(customName) => this.setState({ customName })}></TextInput>

																<TouchableOpacity onPress={() => this.setState({ customName: "" })}>
																	<Icon name="close" color="#aaaaaa" size={22} />
																</TouchableOpacity>
															</View>
														</ScrollView>

														<TouchableOpacity
															style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}
															onPress={() => {
																this.setState({ customTypeOpen: !this.state.customTypeOpen });
															}}
														>
															{this.state.customType != "" ? <Icon name={TypeToIcon[this.state.customType]} size={32} color="#242424" /> : null}
															{this.state.customTypeOpen ? <Icon name="chevron-up" size={32} color="#242424" /> : <Icon name="chevron-down" size={32} color="#242424" />}
														</TouchableOpacity>

														{this.state.customTypeOpen && (
															<View style={{ flexShrink: 1 }}>
																<SearchablePicker
																	values={Object.keys(TypeToIcon).map((k) => ({ search: (k.substr(0, 1).toUpperCase() + k.substr(1)).replace(/_/g, " "), display: TypeToIcon[k], value: k }))}
																	decider={(values, text) => {
																		return values.reduce((pv, cv) => {
																			if (new RegExp(text, "ig").test(cv.search)) {
																				return [...pv, cv].sort((a, b) => (a.search < b.search ? -1 : a.search > b.search ? 1 : 0));
																			}
																			return pv;
																		}, []);
																	}}
																	onSelect={(customType) => {
																		this.setState({ customType, customTypeOpen: false });
																	}}
																	data={this.props.data}
																></SearchablePicker>
															</View>
														)}
													</View>
													<View style={{ position: "absolute", right: 0, bottom: this.state.customTypeOpen ? d.height * 0.125 : d.height * 0.05, width: d.width * 0.1, height: d.width * 0.1, backgroundColor: "#242424", elevation: 6, alignItems: "center", flexDirection: "row", justifyContent: "center", borderRadius: 5 }}>
														<TouchableOpacity
															onPress={() => {
																this.setState({ selectedPlace: { name: this.state.customName, type: this.state.customType }, selectedPlacePos: this.state.posTaken, selectingPlace: false });
															}}
														>
															<Icon name="map-marker-check" color="white" size={42} />
														</TouchableOpacity>
													</View>
												</View>
											</View>
										);

									return (
										<View key={id} style={{ width: d.width * 0.8, height: d.height * 0.3, flexDirection: "row", alignItems: "center" }}>
											{photo && <Image source={{ uri: photo }} style={{ width: Math.round(d.width * 0.4), height: "100%" }} onError={(err) => console.log(err.nativeEvent.error)}></Image>}
											<View style={{ backgroundColor: "white", width: "100%", height: d.height * 0.15, flexDirection: "column", flex: 1, marginRight: "5%", elevation: 5, justifyContent: "space-around", padding: "4%" }}>
												<Text style={{ color: "#242424", fontSize: 22, flex: 1, flexWrap: "wrap" }}>{name}</Text>

												<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
													{types && TypeToIcon[types[0]] && <Icon name={TypeToIcon[types[0]]} size={32} color="#242424" />}
													<Icon name="map-marker-distance" color="#242424" size={22} />
													<Text>{Math.round(distance)} m</Text>
												</View>
											</View>
											<View style={{ position: "absolute", right: 0, bottom: d.height * 0.05, width: d.width * 0.1, height: d.width * 0.1, backgroundColor: "#242424", elevation: 6, alignItems: "center", flexDirection: "row", justifyContent: "center", borderRadius: 5 }}>
												<TouchableOpacity
													onPress={() => {
														this.setState({ selectedPlace: id, selectingPlace: false, selectedPlacePos: pos, customName: name, customType: types[0] });
													}}
												>
													<Icon name="map-marker-check" color="white" size={42} />
												</TouchableOpacity>
											</View>
										</View>
									);
								}}
								itemWidth={d.width * 0.8}
								sliderWidth={d.width}
								onSnapToItem={(currentPage) => {
									if (this.state.customTypeOpen) {
										this.setState({ customTypeOpen: false });
										Keyboard.dismiss();
									}
									if (this.state.keyboardOpen) {
										this.setState({ keyboardOpen: false, currentPage });
										Keyboard.dismiss();
									} else this.setState({ currentPage });
								}}
								horizontal
							/>
						</View>
					</View>
				</ImageBackground>
			);
		return <View></View>;
	}
}

function CalculateDistance(lat1, lon1, lat2, lon2) {
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

interface IPlaceNerby {
	name: string;
	id: string;
	types: Array<string>;
	photo: string;
	distance: number;
	pos: IPos;
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: "2.5%",
		marginLeft: "2.5%",
		marginRight: "2.5%",
		paddingTop: StatusBar.currentHeight,
		alignItems: "center",
	},
});

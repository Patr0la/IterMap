import React from "react";
import { Dimensions, StyleSheet, Text, TextInput, View, ActivityIndicator, Picker } from "react-native";
import { TouchableOpacity, Switch } from "react-native-gesture-handler";
import ImagePicker, { Image as CropImage } from "react-native-image-crop-picker";
import ProgressBar from "react-native-progress/Bar";
import Progress from "react-native-progress";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFetchBlob from "rn-fetch-blob";
import { AutoHeightImage } from "../Components/AutoHeightImage";
import { EditMap } from "../Components/EditMap";
import { MarkerList } from "../Components/MarkerList";
import { PageNavigator } from "../Components/PageNavigator";
import { SearchBox } from "../Components/SearchBox";
import * as config from "../Config.json";
import { CachableImage } from "../Components/CachableImage";

interface Props extends IProps {}

interface State extends IRoute {
	loaded: boolean;

	editing: "route" | "markers";

	fullscreen: boolean;

	selectedDay: number;

	uploadProgress: number;
	uploading: boolean;

	deletingRoute: boolean;
	deletingRouteInProgress: boolean;
}

export class EditRoute extends React.Component<Props, State> {
	private editMap: EditMap;
	private markerList: MarkerList;

	private loadingId: string;
	private loaded: boolean;

	constructor(props: Props) {
		super(props);

		this.state = {
			loaded: false,
			editing: "route",
			fullscreen: false,
			selectedDay: 1,

			uploadProgress: 0,
			uploading: false,

			deletingRoute: false,
			deletingRouteInProgress: false,
		};

		this.addMarker.bind(this);
		this.onMarkerUpdate.bind(this);
	}

	handlers: IMarkerUpdateHandlers = {
		addMarker: (marker) => {
			this.setState({ markers: [...this.state.markers, marker] });

			this.synced = false;
		},
		addMarkerAtDay: (marker, dayToSet) => {
			let done = false;
			let pos = this.state.markers.reduce((pv, { logicFunction, day }, i) => {
				if (done) return pv;

				if (logicFunction == "day" && day > dayToSet) {
					done = true;
					return pv;
				}

				return i;
			}, -1);

			if (pos > 0) this.handlers.addMarkerAtPosition(marker, pos);
			else this.handlers.addMarker(marker);
		},
		addMarkerAtPosition: (marker, position) => {
			this.setState({ markers: [...this.state.markers.slice(0, position + 1), marker, ...this.state.markers.slice(position + 1, this.state.markers.length)] });

			this.synced = false;
		},
		moveMarkers: (s, i, e) => {
			this.synced = false;
		},
		removeMarkerAtPosition: (position) => {
			this.setState({
				markers: [...this.state.markers.slice(0, position), ...this.state.markers.slice(position + 1, this.state.markers.length)],
			});

			this.synced = false;
		},
		setMarkerAtPosition: (marker, position, important?: boolean) => {
			this.setState(
				{
					markers: [...this.state.markers.slice(0, position), marker, ...this.state.markers.slice(position + 1, this.state.markers.length)],
				},
				() => {
					if (important) {
						this.sync();
					}
				},
			);

			this.synced = false;
		},
		switchMarkers: (i1, i2) => {
			let markers = this.state.markers.slice();
			let temp = markers[i2];
			markers[i2] = markers[i1];
			markers[i1] = temp;
			this.setState({ markers });

			this.synced = false;
		},
		onDaySelect: (selectedDay) => {
			this.setState({ selectedDay });

			this.synced = false;
		},
	};

	public LoadRoute(id: string) {
		fetch(`${config.host}/api/getRouteData?id=${id}`, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((route: IRoute) => {
				/*route.markers = [
                    {
                        pictures: [],
                        pos: { latitude: 45, longitude: 12 },
                        title: "1",
                    },
                    { pictures: [], pos: { latitude: 44.5, longitude: 14.5 }, title: "2" },
                    { pictures: [], pos: { latitude: 44.45, longitude: 14.6 }, title: "3" },
                    { pictures: [], pos: { latitude: 44.6, longitude: 14.8 }, title: "4" },
                    { pictures: [], pos: { latitude: 45.1, longitude: 14.8 }, title: "5" },
                ];*/
				this.setState({ ...route, loaded: true });
				this.synced = true;
				this.loaded = true;

				fetch(`${config.host}/api/getRouteDirections?id=${id}`, {
					method: "GET",
					headers: {
						Accept: "application/json",
						Cookie: `session=${this.props.data.token}`,
						"Content-Type": "application/json",
					},
				})
					.then((res) => res.json())
					.then((path: Array<Array<IPos>>) => {
						this.setState({ path });
					});
			});
	}

	addMarker(pos: IPos, id?: string, name?: string) {
		console.log(this);
		this.onMarkerUpdate([...this.state.markers]);
	}

	onMarkerUpdate(markers: Array<IMarker>) {
		this.setState({ markers });

		this.synced = false;
	}

	synced: boolean = false;

	sync() {
		if (this.synced) return;
		console.log("sync");
		this.synced = true;
		let toSend = {
			id: this.state._id,
			markers: this.state.markers,
			title: this.state.title,
			description: this.state.description,
			isPublic: this.state.isPublic,
			cost: this.state.cost
		};
		fetch(`${config.host}/api/setMarkersForRoute`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(toSend),
		}).then((res) => {
			fetch(`${config.host}/api/getRouteDirections?id=${this.state._id || this.props.navigation.getParam("id", "undefined")}`, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Cookie: `session=${this.props.data.token}`,
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.then((path: Array<Array<IPos>>) => {
					console.log(path);
					this.setState({ path });
				});
		});
	}

	syncInterval: NodeJS.Timeout;
	componentDidMount() {
		this.syncInterval = setInterval(() => {
			if (!this.synced) this.sync();
		}, 10000);
	}

	componentWillUnmount() {
		this.sync();
		clearInterval(this.syncInterval);
	}

	render() {
		let id = this.props.navigation.getParam("id");
		if (id != this.state._id && id != this.loadingId) {
			this.loadingId = id;
			this.loaded = false;

			this.LoadRoute(id);
		}

		return (
			<View>
				<PageNavigator
					default="route"
					routes={[
						{ title: "Route", value: "route" },
						{ title: "Locations", value: "markers" },
					]}
					onSelectionChange={(editing) => {
						this.setState({ editing });
					}}
				/>

				{this.state.editing == "route" ? (
					<View style={{ padding: "5%", paddingTop: "2.5%" }}>
						<TextInput
							style={styles.textInput}
							value={this.state.title}
							onChangeText={(title) => {
								this.setState({ title });
								this.synced = false;
							}}
						></TextInput>

						<TextInput
							style={{ ...styles.textInput, height: 100, marginTop: 0 }}
							multiline
							value={this.state?.description}
							placeholder="Description..."
							onChangeText={(description) => {
								this.setState({ description });
								this.synced = false;
							}}
						></TextInput>

						<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<Text style={{ width: "33%" }}>Cost:</Text>

							<TextInput
								keyboardType="numeric"
								style={{ ...styles.textInput, width: "13%", marginTop: 0, marginHorizontal: "5%" }}
								value={this.state?.cost?.value?.toString()}
								onChangeText={(cost) => {
									//@ts-ignore
									this.setState({ cost: { value: cost.length > 0 ? (isNaN(parseInt(cost)) ? this.state.cost.value : parseInt(cost)) : "", currency: this.state?.cost?.currency ?? "Local" } });
									this.synced = false;
								}}
							></TextInput>
							<Picker
								mode="dropdown"
								onValueChange={(currency) => {
									this.setState({ cost: { value: this.state.cost.value, currency } });
									this.synced = false;
								}}
								selectedValue={this.state?.cost?.currency ?? "Local"}
								style={{ width: "43%" }}
							>
								<Picker.Item label="€" value="€"></Picker.Item>
								<Picker.Item label="$" value="$"></Picker.Item>
								<Picker.Item label="£" value="£"></Picker.Item>
								<Picker.Item label="Local currency" value="Local"></Picker.Item>
							</Picker>
						</View>

						{this.state.deletingRoute ? (
							this.state.deletingRouteInProgress ? (
								<View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", height: d.height * 0.1, width: "100%" }}>
									<ActivityIndicator color="#ad0a4c" animating={true} style={{ width: 50, height: 50 }}></ActivityIndicator>
								</View>
							) : (
								<View style={{ flexDirection: "column", justifyContent: "space-evenly", alignItems: "center", height: d.height * 0.2 }}>
									<Text>Are you sure you want to delete this route?</Text>
									<View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", height: d.height * 0.1, width: "100%" }}>
										<TouchableOpacity
											style={{ alignItems: "center" }}
											onPress={() => {
												this.setState({ deletingRoute: true, deletingRouteInProgress: true });

												fetch(`${config.host}/api/deleteRoute`, {
													headers: {
														Accept: "application/json",
														Cookie: `session=${this.props.data.token}`,
														"Content-Type": "application/json",
													},
													method: "POST",
													body: JSON.stringify({ id: this.state._id }),
												})
													.then((res) => res.json())
													.then((state) => {
														console.table(state);
														if (state?.sucess) {
															this.setState({ deletingRoute: false, deletingRouteInProgress: false });
															this.props.navigation.setParams({ mandatoryRefresh: true });
															this.props.navigation.goBack();
														}
													});
											}}
										>
											<Icon name="delete" color="red" size={22} />
											<Text>Delete</Text>
										</TouchableOpacity>
										<TouchableOpacity
											style={{ alignItems: "center" }}
											onPress={() => {
												this.setState({ deletingRoute: false });
											}}
										>
											<Icon name="close" color="#242424" size={22} />
											<Text>Cancle</Text>
										</TouchableOpacity>
									</View>
								</View>
							)
						) : (
							<View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", height: d.height * 0.1 }}>
								<View style={{ flex: 1, alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
									<Text>Is public: </Text>
									<Switch
										value={this.state.isPublic}
										thumbColor="#242424"
										trackColor={{ false: "#aaaaaa", true: "#ad0a4c" }}
										onValueChange={(isPublic) => {
											this.setState({ isPublic });
											this.synced = false;
										}}
									></Switch>
								</View>
								<View style={{ flex: 1, alignItems: "center", flexDirection: "column" }}>
									<TouchableOpacity
										style={{ alignItems: "center" }}
										onPress={() => {
											this.setState({ deletingRoute: true });
										}}
									>
										<Icon name="delete" color="#242424" size={22} />
										<Text>Delete route</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}

						<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly" }}>
							{this.state.uploading ? (
								<View style={{ backgroundColor: "white", width: "100%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", height: d.height * 0.05 }}>
									<ProgressBar progress={this.state.uploadProgress} width={d.width * 0.5} height={20} color="#ad0a4c" borderRadius={10} useNativeDriver={true}></ProgressBar>

									<Text style={{ color: "#242424" }}>{Math.round(this.state.uploadProgress * 100)}%</Text>
								</View>
							) : this.state._id ? (
								<View style={{ flex: 1, width: "100%", marginTop: "10%", minHeight: 100 }}>
									<AutoHeightImage
										parent={this}
										source={{
											uri: `${config.host}/api/routeImage?id=${this.state._id}`,
											headers: {},
											// TODO get headers
											// headers: {
											// 	Cookie: `session=${this.props.data.token}`,
											// },
											// method: "GET"
										}}
										imageProps={{
											source: null,
											style: {
												backgroundColor: "white",
											},
										}}
										width={d.width * 0.4}
										data={this.props.data}
										cantUpdateCuzOfImageCacheBug
									></AutoHeightImage>
								</View>
							) : null}
							<TouchableOpacity
								style={{ flexDirection: "column", alignItems: "center" }}
								onPress={() => {
									ImagePicker.openPicker({
										multiple: false,
										mediaType: "photo",
										includeBase64: false,
										includeExif: true,
										compressImageQuality: 0.8,
										compressImageMaxWidth: 2048,
										compressImageMaxHeight: 1080,
										writeTempFile: true,
									}).then((res: CropImage) => {
										let toUp = [
											{ name: "routeId", data: this.state._id },
											{ name: "any_name", filename: "any_filename.jpg", type: res.mime, data: `RNFetchBlob-${res.path}` },
										];

										this.setState({ uploadProgress: 0, uploading: true });
										RNFetchBlob.fetch(
											"POST",
											`${config.host}/api/uploadRouteImage`,
											{
												Cookie: `session=${this.props.data.token}`,
												"Content-Type": "multipart/form-data",
											},
											toUp,
										)
											.uploadProgress({ interval: 100 }, (sent, total) => {
												this.setState({ uploadProgress: sent / total });
											})
											.then((res) => {
												let data = res.json();

												this.setState({ uploadProgress: 1 });

												setTimeout(() => {
													this.setState({ uploading: false });
												}, 1000);
											})
											.catch((err) => {
												this.setState({ uploading: false });
												err && console.log(err);
											});
									});
								}}
							>
								<Icon name="image" size={28} color="#242424" />
								<Text>Upload route image</Text>
							</TouchableOpacity>
						</View>
					</View>
				) : (
					<View style={{ width: "100%", height: "100%", flexDirection: "column" }}>
						<View>
							<SearchBox
								endpoint="findLocation"
								navigation={this.props.navigation}
								data={this.props.data}
								requestPrepeareCallback={async () => {
									let { center } = await this.editMap.MapView.getCamera();
									return { lat: center.latitude, lng: center.longitude };
								}}
								onSelectCallback={(selection) => {
									this.editMap.MapView.animateToRegion({ ...selection.viewport, latitude: selection.viewport.latitude - selection.viewport.latitudeDelta / 2, longitude: selection.viewport.longitude - selection.viewport.longitudeDelta / 2 }, 1000);
								}}
								placeHolder="Search for places.."
							/>
						</View>

						<View style={{ width: "100%", zIndex: this.state.fullscreen ? 0 : 10 }}>
							<EditMap routeId={this.state._id} markerList={this.markerList} markers={this.state.markers} ref={(ref) => (this.editMap = ref)} handlers={this.handlers} data={this.props.data} path={this.state.path} selectedDay={this.state.selectedDay}></EditMap>
						</View>

						<MarkerList
							selectedDay={this.state.selectedDay}
							ref={(ref) => (this.markerList = ref)}
							routeId={this.state._id}
							handlers={this.handlers}
							markers={this.state.markers}
							Map={this.editMap}
							data={this.props.data}
							navigation={this.props.navigation}
							onFullscreenChange={(fullscreen) => {
								this.setState({ fullscreen });
							}}
							fullscreen={this.state.fullscreen}
						></MarkerList>
					</View>
				)}
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	textInput: {
		borderBottomColor: "#ad0a4c",
		borderBottomWidth: 2,
		marginTop: 10,
	},
	button: {
		backgroundColor: "#242424",
		color: "white",
		justifyContent: "center",
	},
	buttonText: {
		width: d.width / 2,
		fontSize: 16,
		lineHeight: 16,
		height: 44,
		color: "white",
		textAlignVertical: "center",
		textAlign: "center",
		fontWeight: "bold",
	},
	addMainImage: {
		height: 128,
		width: 128,
		justifyContent: "center",
		flexDirection: "column",
	},
});

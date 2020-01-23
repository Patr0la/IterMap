import React from "react";
import { EditMap } from "../Components/EditMap";
import { MarkerList } from "../Components/MarkerList";
import { View, Button, TextInput, StyleSheet, Text, Dimensions, StatusBarIOS, StatusBar, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import * as config from "../Config.json";
import { SearchBox } from "../Components/SearchBox";
import { PageNavigator } from "../Components/PageNavigator";

import ImagePicker, { Image as CropImage } from "react-native-image-crop-picker";
import RNFetchBlob from "rn-fetch-blob";
import ProgressBar from "react-native-progress/Bar";
import { CachableImage } from "../Components/CachableImage";

interface Props extends IProps {}

interface State extends IRoute {
	loaded: boolean;

	editing: "route" | "markers";

	fullscreen: boolean;

	selectedDay: number;

	uploadProgress: number;
	uploading: boolean;
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
						console.log("IMPORTANT UPDATE");
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
						console.log(path);
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

		console.log("Marker update");
		this.synced = false;
	}

	synced: boolean = false;

	sync() {
		if (this.synced) return;
		console.log("Sync");
		this.synced = true;
		fetch(`${config.host}/api/setMarkersForRoute`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id: this.state._id,
				markers: this.state.markers,
				title: this.state.title
			}),
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

						<View style={{ flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
							{this.state.uploading ? (
								<View style={{ backgroundColor: "white", width: "100%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", height: d.height * 0.05 }}>
									<ProgressBar progress={this.state.uploadProgress} width={d.width * 0.5} height={20} color="#ad0a4c" borderRadius={10} useNativeDriver={true}></ProgressBar>

									<Text style={{ color: "#242424" }}>{Math.round(this.state.uploadProgress * 100)}%</Text>
								</View>
							) : this.state._id ? (
								<View style={{ flex: 1, width: "100%", marginTop: "10%" }}>
									<CachableImage
										source={{
											uri: `${config.host}/api/routeImage?url=${this.state._id}`,
											headers: {},
											// TODO get headers
											// headers: {
											// 	Cookie: `session=${this.props.data.token}`,
											// },
											// method: "GET"
										}}
										imageProps={{
											source: null,
											resizeMethod: "auto",
											resizeMode: "cover",
											style: { width: d.height * 100, height: null, flex: 1},
										}}
										data={this.props.data}
									></CachableImage>
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
										compressImageQuality: 1,
										writeTempFile: true,
									}).then((res: CropImage) => {
										let toUp = [
											{ name: "routeId", data: this.state._id },
											{ name: "any_name", filename: "any_filename.jpg", type: res.mime, data: `RNFetchBlob-${res.path}` },
										];

										console.table(toUp);

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
												console.log(`${Math.round((sent / total) * 100)}%`);

												this.setState({ uploadProgress: sent / total });
											})
											.then((res) => {
												console.log(res);

												let data = res.json();

												this.setState({ uploading: false });
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
									console.table(selection);

									// TODO Animate to region after it is fixed.
									// console.table({ latitude, longitude, latitudeDelta: latitude - selection.southwest.latitude, longitudeDelta: longitude - selection.southwest.longitude })

									//this.editMap.MapView.animateCamera({ center: { latitude: selection.latitude, longitude: selection.longitude } });

									// this.setState({ canRender: false })
									// console.log("Forced updates");
									console.log(selection.viewport);
									console.log("REEE");
									this.editMap.MapView.animateToRegion({ ...selection.viewport, latitude: selection.viewport.latitude - selection.viewport.latitudeDelta / 2, longitude: selection.viewport.longitude - selection.viewport.longitudeDelta / 2 }, 1000);
									// this.editMap.MapView.forceUpdate();
									//[selection.northeast, selection.southwest], {animated: false, edgePadding: {bottom: 10, top: 10, left: 10, right: 10}});
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

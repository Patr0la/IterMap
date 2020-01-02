import React from "react";
import { EditMap } from "../Components/EditMap";
import { MarkerList } from "../Components/MarkerList";
import { View, Button, TextInput, StyleSheet, Text, Dimensions, StatusBarIOS, StatusBar } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import * as config from "../Config.json";
import { SearchBox } from "../Components/SearchBox";

interface Props extends IProps {}

interface State extends IRoute {
	loaded: boolean;

	editing: "route" | "markers";

	fullscreen: boolean;

	selectedDay: number;
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
			editing: "markers",
			fullscreen: false,
			selectedDay: 1,
		};

		this.addMarker.bind(this);
		this.onMarkerUpdate.bind(this);
	}

	handlers: IMarkerUpdateHandlers = {
		addMarker: (marker) => {
			this.setState({ markers: [...this.state.markers, marker] });
		},
		addMarkerAtDay: (marker, day) => {
			// let done = false;
			// let pos = this.state.markers.reduce((pv, { logicFunction, day }, i) => {
			// 	if (done) return pv;
			// 	if (logicFunction == "day" && i > this.props.i && day > marker.day) {
			// 		done = true;
			// 		return pv;
			// 	}
			// 	return pv;
			// }, -1);

			this.handlers.addMarker(marker);
		},
		addMarkerAtPosition: (marker, position) => {},
		moveMarkers: (s, i, e) => {},
		removeMarkerAtPosition: (position) => {
			this.setState({
				markers: [...this.state.markers.slice(0, position), ...this.state.markers.slice(position + 1, this.state.markers.length)],
			});
		},
		setMarkerAtPosition: (marker, position) => {
			this.setState({
				markers: [...this.state.markers.slice(0, position), marker, ...this.state.markers.slice(position + 1, this.state.markers.length)],
			});
		},
		switchMarkers: (i1, i2) => {
			let markers = this.state.markers.slice();
			let temp = markers[i2];
			markers[i2] = markers[i1];
			markers[i1] = temp;
			this.setState({ markers });
		},
		onDaySelect: (selectedDay) => {
			this.setState({ selectedDay });
		},
	};

	public LoadRoute(id: string) {
		fetch(`${config.host}/getRouteData?id=${id}`, {
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
				this.loaded = true;

				fetch(`${config.host}/getRouteDirections?id=${id}`, {
					method: "GET",
					headers: {
						Accept: "application/json",
						Cookie: `session=${this.props.data.token}`,
						"Content-Type": "application/json",
					},
				})
					.then((res) => res.json())
					.then((path: Array<IPos>) => {
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
		console.log("Sync");
		fetch(`${config.host}/setMarkersForRoute`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id: this.state._id,
				markers: this.state.markers,
			}),
		}).then((res) => {
			fetch(`${config.host}/getRouteDirections?id=${this.state._id || this.props.navigation.getParam("id", "undefined")}`, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Cookie: `session=${this.props.data.token}`,
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.then((path: Array<IPos>) => {
					this.setState({ path });
				});
		});
	}

	syncInterval: NodeJS.Timeout;
	componentDidMount() {
		this.syncInterval = setInterval(() => {
			this.sync();
		}, 5000);
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
				<View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
					<TouchableOpacity
						style={{
							...styles.button,
							...(this.state.editing == "route" ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}),
						}}
						onPress={() => this.setState({ editing: "route" })}
					>
						<Text style={styles.buttonText}>Route</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{ ...styles.button, ...(this.state.editing == "markers" ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}) }}
						onPress={() => {
							this.setState({ editing: "markers" });
							this.LoadRoute(this.state._id);
						}}
					>
						<Text style={styles.buttonText}>Locations</Text>
					</TouchableOpacity>
				</View>

				{this.state.editing == "route" ? (
					<View>
						<TextInput style={styles.textInput} value={this.state.title} onChangeText={(title) => this.setState({ title })}></TextInput>
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
							<EditMap markers={this.state.markers} ref={(ref) => (this.editMap = ref)} handlers={this.handlers} data={this.props.data}></EditMap>
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
		borderColor: "#aaaaaa",
		borderWidth: 2,
		marginLeft: 20,
		marginRight: 20,
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

import React from "react";
import { View, Platform, StyleSheet, Dimensions, ImageBackground, Image } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BetterImage } from "./BetterImage";

import * as config from "../Config.json";
import { MapStyle } from "../MapStyle";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MarkerList } from "./MarkerList";
import { CachableImage } from "./CachableImage";

interface Props extends IProps, IRoute {
	routeId: string;

	handlers: IMarkerUpdateHandlers;

	selectedDay: number;

	markerList: MarkerList;
}

interface State {
	displayHeatMap: boolean;
	displayMarkers: boolean;
	displayPath: boolean;
	displaySatelite: boolean;

	displayOptions: boolean;
}

export class EditMap extends React.Component<Props, State> {
	public MapView: MapView;

	constructor(props: Props) {
		super(props);

		this.state = {
			...props,

			displayHeatMap: props.data.displayHeatMap,
			displayMarkers: props.data.displayMarkers,
			displayPath: props.data.displayPath,
			displaySatelite: props.data.displaySatelite,

			displayOptions: false,
		};
	}

	markersOnMap: Array<JSX.Element>;
	loaded: boolean;

	render() {
		if (this.props.markers)
			this.markersOnMap = this.props.markers.reduce((pv, { isLogicMarker, logicFunction, pos, pictures, title }, i) => {
				if (isLogicMarker) {
					if (logicFunction == "waypoint")
						return pv.concat(
							<Marker
								draggable
								onDragEnd={(e) => {
									this.props.handlers.setMarkerAtPosition({ ...this.props.markers[i], pos: e.nativeEvent.coordinate }, i);
								}}
								coordinate={pos}
								key={i}
								onPress={() => {
									this.props.markerList?.scrollView?.scrollTo({ y: i * 80 });
								}}
							>
								<View style={{ width: 72, height: 72 }}>
									<Icon name="map-marker" size={72} style={{ position: "absolute" /*marginTop: 5*/ }} color="#aaaaaa" />
								</View>
							</Marker>,
						);
					return pv;
				}

				return pv.concat(
					<Marker
						coordinate={pos}
						key={i}
						draggable={title.split("_")[0] == "marker"}
						onDragEnd={(e) => {
							this.props.handlers.setMarkerAtPosition({ ...this.props.markers[i], pos: e.nativeEvent.coordinate }, i);
						}}
						onPress={() => {
							this.props.markerList?.scrollView?.scrollTo({ y: i * 80 });
						}}
					>
						{pictures && pictures[0] ? (
							<View style={{ width: 72, height: 72 }}>
								<Icon name="map-marker" size={72} style={{ position: "absolute" /*marginTop: 5*/ }} color="#242424" />

								<CachableImage
									source={{
										uri: `${config.host}/api/routeImages?route=${this.props.routeId}&image=${pictures[0]}&form=cover`,
										headers: {
											//TODO get headers
										},
									}}
									imageProps={{
										source: null,
										style: { width: 42, height: 42, borderRadius: 21, marginLeft: 15, marginTop: 8 },
									}}
									data={this.props.data}
								></CachableImage>
							</View>
						) : (
							<View style={{ width: 72, height: 72 }}>
								<Icon name="map-marker" size={72} style={{ position: "absolute" /*marginTop: 5*/ }} color="#242424" />
							</View>
						)}

						{/*
							
							{<BetterImage  imageSource="web" cacheImage={false} imageStyle={{ width: 72, height: 72, borderRadius: 36 }} parentViewStyle={{ flex: 1 }} data={this.props.data} navigation={this.props.navigation}></BetterImage>}
					</View>*/}
					</Marker>,
				);
			}, []);

		// if (this.MapView && (this.state.path?.length > 2 || this.state.livePath?.length)) {
		// 	this.MapView.fitToCoordinates(this.state.path?.length > 2 ? this.state.path : this.state.livePath, { animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } });
		// }

		return (
			<View style={{ width: "100%", height: d.height / 2, zIndex: 1, padding: "5%", alignItems: "flex-end", flexDirection: "column", justifyContent: "space-between" }}>
				<MapView
					cacheEnabled
					onPoiClick={(e) =>
						this.props.handlers.addMarkerAtDay(
							{
								isLogicMarker: false,
								logicFunction: "location",
								pictures: [],
								pos: e.nativeEvent.coordinate,
								title: e.nativeEvent.name,
								description: "",
								price: { currency: "€", value: 0 },
								time: "",
								id: e.nativeEvent.placeId,
								types: [],
								day: this.props.markers.reduce((pv, { day }) => Math.max(pv, day), 0),
							},
							this.props.selectedDay,
						)
					}
					ref={(ref) => (this.MapView = ref)}
					//onLayout={() => this.props.onMapLayout()}
					style={styles.map}
					mapType={this.state.displaySatelite ? "satellite" : "standard"}
					customMapStyle={MapStyle}
					provider={PROVIDER_GOOGLE}
					// initialRegion={{
					// 	latitude: this.state && this.state.lastMapPosition ? this.state.lastMapPosition.latitude : 0,
					// 	longitude: this.state && this.state.lastMapPosition ? this.state.lastMapPosition.longitude : 0,
					// 	latitudeDelta: 0.04,
					// 	longitudeDelta: 0.02,
					// }}
					onLongPress={(e) => {
						this.props.handlers.addMarkerAtDay(
							{
								isLogicMarker: true,
								logicFunction: "waypoint",
								pictures: [],
								pos: e.nativeEvent.coordinate,
								title: "Waypoint",
								description: "",
								price: null,
								time: "",
								id: `waypoint_${new Date().getTime()}`,
								types: [],
								day: this.props.markers.reduce((pv, { day }) => Math.max(pv, day), 0),
							},
							this.props.selectedDay,
						);
					}}
					onPress={(e) => {
						this.props.handlers.addMarker({
							isLogicMarker: false,
							logicFunction: "location",
							pictures: [],
							pos: e.nativeEvent.coordinate,
							title: "Untitled",
							description: "",
							price: { currency: "€", value: 0 },
							time: "",
							id: `marker_${new Date().getTime()}`,
							types: [],
							day: this.props.markers.reduce((pv, { day }) => Math.max(pv, day), 0),
						});
					}}
					onMarkerPress={(e) => {
						console.log(e);
					}}
					onLayout={(e) =>
						this.props.path?.length > 2
							? this.MapView.fitToCoordinates(
									this.props.path.reduce((pv, p) => pv.concat(p), []),
									{ animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } },
							  )
							: this.props.livePath?.length
							? this.MapView.fitToCoordinates(this.props.livePath, { animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } })
							: null
					}
				>
					{this.state.displayMarkers && this.markersOnMap}
					{/*this.state && this.props.path && this.props.path.length > 1 && this.props.path[this.props.selectedDay - 1].map((path) => (path.length > 0 ? <Polyline coordinates={path} strokeColor="#AD0A4C" strokeWidth={6}></Polyline> : null))*/}

					{this.props?.path?.[this.props.selectedDay - 1]?.length > 1 && <Polyline coordinates={this.props.path[this.props.selectedDay - 1]} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}

					{this.state && this.props.livePath && this.props.livePath.length > 1 && <Polyline coordinates={this.props.livePath} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}
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
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	textInput: {
		width: "100%",
	},
	picker: {
		height: 50,
		width: 50,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#eee",

		...Platform.select({
			ios: {
				paddingTop: 20,
			},
		}),
	},

	title: {
		fontSize: 20,
		paddingVertical: 20,
		color: "#999999",
	},

	list: {
		flex: 1,
	},

	contentContainer: {
		width: d.width,

		...Platform.select({
			ios: {
				paddingHorizontal: 30,
			},

			android: {
				paddingHorizontal: 0,
			},
		}),
	},

	row: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 16,
		height: 80,
		flex: 1,
		marginTop: 7,
		marginBottom: 12,
		borderRadius: 4,

		...Platform.select({
			ios: {
				width: d.width - 30 * 2,
				shadowColor: "rgba(0,0,0,0.2)",
				shadowOpacity: 1,
				shadowOffset: { height: 2, width: 2 },
				shadowRadius: 2,
			},

			android: {
				width: d.width - 30 * 2,
				elevation: 0,
				marginHorizontal: 30,
			},
		}),
	},

	image: {
		width: 50,
		height: 50,
		marginRight: 30,
		borderRadius: 25,
	},

	text: {
		fontSize: 24,
		color: "#222222",
	},
});

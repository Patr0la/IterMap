import React from "react";
import { View, Platform, StyleSheet, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BetterImage } from "./BetterImage";

import * as config from "../Config.json";
import { MapStyle } from "../MapStyle";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CachableImage } from "./CachableImage";

interface Props extends IProps, IRoute {
	addMarker: (pos: IPos, id?: string, name?: string) => void;
}

interface State extends IRoute {
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
			this.markersOnMap = this.props.markers.reduce(
				(pv, m, i) =>
					!m.isLogicMarker
						? pv.concat(
								<Marker coordinate={m.pos} key={i}>
									<View style={{ width: 56, height: 56 }}>
										<Icon name="map-marker" size={56} style={{ position: "absolute" /*marginTop: 5*/ }} color="#242424" />
										{m.pictures && m.pictures[0] && (
											<CachableImage
												source={{
													uri: `${config.host}/api/routeImages?route=${this.state._id}&image=${m.pictures[0]}`,
													headers: {},
													//TODO get headers
												}}
												imageProps={{
													source: null,
													style: { width: 32, height: 32, borderRadius: 16 },
												}}
												data={this.props.data}
											></CachableImage>
										)}
									</View>
								</Marker>,
						  )
						: pv,
				[],
			);

		// if (this.MapView && (this.state.path?.length > 2 || this.state.livePath?.length)) {
		// 	this.MapView.fitToCoordinates(this.state.path?.length > 2 ? this.state.path : this.state.livePath, { animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } });
		// }

		return (
			<View style={{ width: "100%", height: d.height / 2, zIndex: 1, padding: "5%", alignItems: "flex-end", flexDirection: "column", justifyContent: "space-between" }}>
				<MapView
					cacheEnabled
					onPoiClick={(e) => this.props.addMarker(e.nativeEvent.coordinate, e.nativeEvent.placeId, e.nativeEvent.name)}
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
					onPress={(e) => {
						this.props.addMarker(e.nativeEvent.coordinate);
					}}
					onMarkerPress={(e) => {
						console.log(e);
					}}
					onLayout={(e) => (this.state.path?.length > 2 ? this.MapView.fitToCoordinates(this.state.path, { animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } }) : this.state.livePath?.length ? this.MapView.fitToCoordinates(this.state.livePath, { animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } }) : null)}
				>
					{this.markersOnMap}
					{this.state && this.state.path && this.state.path.length > 1 && <Polyline coordinates={this.state.path} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}
					{this.state && this.state.livePath && this.state.livePath.length > 1 && <Polyline coordinates={this.state.livePath} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}
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

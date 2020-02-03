import React from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as config from "../Config.json";
import { MapStyle } from "../MapStyle";
import { CachableImage } from "./CachableImage";
import { PreviewMarkerList } from "./PreviewMarkerList";

interface Props extends IProps, IRoute {
	routeId: string;

	selectedDay: number;
	selectedMarker: number;

	markerList: PreviewMarkerList;
}

interface State {
	displayHeatMap: boolean;
	displayMarkers: boolean;
	displayPath: boolean;
	displaySatelite: boolean;

	displayOptions: boolean;
}

export class PreviewMap extends React.Component<Props, State> {
	public MapView: MapView;

	constructor(props: Props) {
		super(props);

		this.state = {
			...props,

			displayHeatMap: false,
			displayMarkers: true,
			displayPath: true,
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
					return pv;
				}

				return pv.concat(
					<Marker
						coordinate={pos}
						key={i}
						onPress={() => {
							console.log("PRESS")
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
			<View style={{ width: "100%", height: d.height * 0.35, zIndex: 1, padding: "5%", alignItems: "flex-end", flexDirection: "column", justifyContent: "space-between", backgroundColor : "white"}}>
				<MapView
					cacheEnabled
					ref={(ref) => (this.MapView = ref)}
					//onLayout={() => this.props.onMapLayout()}
					style={styles.map}
					mapType={this.state.displaySatelite ? "satellite" : "standard"}
					customMapStyle={MapStyle}
					provider={PROVIDER_GOOGLE}
					liteMode
					scrollEnabled={true}
					// initialRegion={{
					// 	latitude: this.state && this.state.lastMapPosition ? this.state.lastMapPosition.latitude : 0,
					// 	longitude: this.state && this.state.lastMapPosition ? this.state.lastMapPosition.longitude : 0,
					// 	latitudeDelta: 0.04,
					// 	longitudeDelta: 0.02,
					// }}

					onLayout={(e) =>
						this.props.path?.length > 2
							? this.MapView.fitToCoordinates(
									this.props.path.reduce((pv, p) => pv.concat(p), []),
									{ animated: false, edgePadding: { bottom: 100, left: 100, right: 100, top: 100 } },
							  )
							: this.props.livePath?.length
							? this.MapView.fitToCoordinates(this.props.livePath, { animated: false, edgePadding: { bottom: 100, left: 100, right: 100, top: 100 } })
							: null
					}
				>
					{this.state.displayMarkers && this.markersOnMap}
					{/*this.state && this.props.path && this.props.path.length > 1 && this.props.path[this.props.selectedDay - 1].map((path) => (path.length > 0 ? <Polyline coordinates={path} strokeColor="#AD0A4C" strokeWidth={6}></Polyline> : null))*/}
					{(() => {
						console.log("DAY: "  + this.props.selectedDay);
						return null;
					})()}
					{this.props?.path?.[this.props.selectedDay - 1]?.length > 1 && <Polyline coordinates={this.props.path[this.props.selectedDay - 1]} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}
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
						</View>
					)}
				</View>
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

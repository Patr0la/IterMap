import React from "react";
import { EditMap } from "./EditMap";
import { PanResponderInstance, Dimensions, PanResponder, ScrollView, View, Text, StyleSheet, Platform, ProgressViewIOSComponent, Image } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { BetterImage } from "./BetterImage";

import * as config from "../Config.json";
import { TouchableOpacity } from "react-native-gesture-handler";
import { CachableImage } from "./CachableImage";

interface Props extends IProps {
	routeId: string;

	i: number;
	top: number;

	map: EditMap;
	markers: Array<IMarker>;

	handlers: IMarkerUpdateHandlers;

	selectedDay: number;
}

interface State {
	// i: number;
	// top: number;
	// markers: Array<IMarker>;
	// markerElements: Array<Marker>;
	// lastPosition: number;
	// canCallScrollTo: boolean;
	// exists: boolean;
}

export class Marker extends React.Component<Props, State> {
	_panResponder: PanResponderInstance;
	constructor(props: Props) {
		super(props);
	}

	render() {
		let marker = this.props.markers[this.props.i];
		if (marker.isLogicMarker) {
			if (marker.logicFunction == "day")
				return (
					<View
						style={{ ...styles.marker, top: this.props.top, justifyContent: "center" }}
						onTouchEnd={() => {
							this.props.handlers.onDaySelect(marker.day);
							let done = false;
							let cords = this.props.markers.reduce((pv, { logicFunction, day, pos }, i) => {
								if (done) return pv;
								if (logicFunction == "day" && i > this.props.i && day > marker.day) {
									done = true;
									return pv;
								}
								if (i > this.props.i && pos) {
									return pv.concat(pos);
								}
								return pv;
							}, []);

							cords?.length > 0 && this.props.map.MapView.fitToCoordinates(cords, { animated: true, edgePadding: { bottom: 20, top: 100, left: 50, right: 50 } });
						}}
					>
						<Text style={{ marginHorizontal: "5%" }}>{marker.title}</Text>
						<View style={{ flex: 1, height: 2, backgroundColor: this.props.selectedDay == marker.day ? "#ad0a4c" : "#242424", marginRight: marker.day > 1 ? 0 : 16 }} />

						{marker.day != 1 && (
							<TouchableOpacity
								onPress={() => {
									this.props.handlers.removeMarkerAtPosition(this.props.i);
								}}
							>
								<Icon name="close" size={32} color="red" />
							</TouchableOpacity>
						)}

						{marker.day > 1 && (
							<View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
								{this.props.i > 0 && (
									<TouchableOpacity
										onPress={() => {
											this.props.handlers.switchMarkers(this.props.i - 1, this.props.i);
										}}
									>
										<Icon name="chevron-up" size={24} color="#242424"></Icon>
									</TouchableOpacity>
								)}

								{this.props.i < this.props.markers.length - 1 && (
									<TouchableOpacity
										onPress={() => {
											this.props.handlers.switchMarkers(this.props.i + 1, this.props.i);
										}}
									>
										<Icon name="chevron-down" size={24} color="#242424"></Icon>
									</TouchableOpacity>
								)}
							</View>
						)}
					</View>
				);

			return (
				<View
					style={{ ...styles.marker, top: this.props.top, justifyContent: "center" }}
					onTouchEnd={() => {
						this.props.map.MapView.animateCamera({ center: marker.pos });
					}}
				>
					<Text style={{ marginHorizontal: "5%" }}>{marker.title}</Text>
					<View style={{ flex: 1, height: 2, backgroundColor: "#242424", marginRight: marker.day > 1 ? 0 : 16 }} />

					{
						<TouchableOpacity
							onPress={() => {
								this.props.handlers.removeMarkerAtPosition(this.props.i);
							}}
						>
							<Icon name="close" size={32} color="red" />
						</TouchableOpacity>
					}

					{
						<View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
							{this.props.i > 0 && (
								<TouchableOpacity
									onPress={() => {
										this.props.handlers.switchMarkers(this.props.i - 1, this.props.i);
									}}
								>
									<Icon name="chevron-up" size={24} color="#242424"></Icon>
								</TouchableOpacity>
							)}

							{this.props.i < this.props.markers.length - 1 && (
								<TouchableOpacity
									onPress={() => {
										this.props.handlers.switchMarkers(this.props.i + 1, this.props.i);
									}}
								>
									<Icon name="chevron-down" size={24} color="#242424"></Icon>
								</TouchableOpacity>
							)}
						</View>
					}
				</View>
			);
		}

		return (
			<View
				onTouchEnd={(e) => {
					e.nativeEvent.pageX < d.width - 90 && this.props.map?.MapView?.animateCamera({ center: marker.pos });
				}}
				// {...this._panResponder.panHandlers} // TODO prebaciti se na slider, trenutačno previše glitcha
				style={{ ...styles.marker, top: this.props.top }}
			>
				{marker?.pictures?.[0] && (
					<CachableImage
						source={{ uri: `${config.host}/api/routeImages?route=${this.props.routeId}&image=${marker.pictures[0]}&form=cover`, headers: {} }}
						imageProps={{
							source: null,
							style: { width: 42, height: 42, borderRadius: 21 },
						}}
						data={this.props.data}
					></CachableImage>
				)}
				{/*<BetterImage url={`${config.host}/api/routeImages?route=${this.props.routeId}&image=${marker?.pictures?.[0]}&form=cover`} imageSource="web" cacheImage={false} imageStyle={{ width: 32, height: 32, borderRadius: 16 }} parentViewStyle={{ width: 32, height: 32 }} data={this.props.data} navigation={this.props.navigation}></BetterImage>*/}
				<Text
					onPress={() => {
						this.props.map?.MapView?.animateCamera({ center: marker.pos });
					}}
					style={{ flexGrow: 10, marginLeft: 6, color: "#242424" }}
				>
					{marker.title}
				</Text>
				<TouchableOpacity
					onPress={() => {
						this.props.handlers.removeMarkerAtPosition(this.props.i);
					}}
				>
					<Icon name="close" size={32} color="red" />
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						this.props.navigation.navigate("MarkerEditScreen", {
							data: { ...marker, routeId: this.props.routeId },
							callback: (data: IMarker) => {
								console.log(data);

								let newMarker: IMarker = {
									isLogicMarker: data.isLogicMarker,
									logicFunction: data.logicFunction,
									id: data.id,
									types: data.types,
									description: data.description,
									pos: data.pos,
									price: data.price,
									time: data.time,
									pictures: data.pictures,
									title: data.title,

									day: data.day,
								};

								this.props.handlers.setMarkerAtPosition(newMarker, this.props.i, true);
							},
						});
					}}
				>
					<Icon name="pencil" size={32} color="#242424"></Icon>
				</TouchableOpacity>
				<View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
					{this.props.i > 0 && (
						<TouchableOpacity
							onPress={() => {
								this.props.handlers.switchMarkers(this.props.i - 1, this.props.i);
							}}
						>
							<Icon name="chevron-up" size={24} color="#242424"></Icon>
						</TouchableOpacity>
					)}

					{this.props.i < this.props.markers.length - 1 && (
						<TouchableOpacity
							onPress={() => {
								this.props.handlers.switchMarkers(this.props.i + 1, this.props.i);
							}}
						>
							<Icon name="chevron-down" size={24} color="#242424"></Icon>
						</TouchableOpacity>
					)}
				</View>
				{
					/*<View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center" }}>
					<Text style={{ justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
						<Icon name="menu" size={40} color="#242424"></Icon>
					</Text>
                </View>*/
					// TODO slider
				}
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	marker: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",

		position: "absolute",
		width: "90%",
		marginLeft: "5%",

		backgroundColor: "#fff",
		paddingTop: 16,
		paddingBottom: 16,
		paddingLeft: 16,
		height: 60,
		flex: 1,
		marginTop: 7,
		marginBottom: 12,
		borderRadius: 4,

		...Platform.select({
			android: {
				shadowColor: "#aaaaaa",
				elevation: 5,
			},
			ios: {
				shadowColor: "#aaaaaa",
				shadowOpacity: 1,
				shadowOffset: { height: 5, width: 5 },
				shadowRadius: 4,
			},
		}),
	},
});

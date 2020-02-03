import React from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View, PanResponder, PanResponderInstance } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { EditMap } from "./EditMap";
import { Marker } from "./Marker";
import Carousel, { getInputRangeFromIndexes } from "react-native-snap-carousel";
import { PreviewMap } from "./PreviewMap";
import { CachableImage } from "./CachableImage";
import * as config from "../Config.json";
import { RoutePreview } from "../Screens/RoutePreview";

interface Props extends IProps {
	markers: Array<IMarker>;
	routeId: string;

	focusTo: (day: number, marker: number) => void;

	selectedDay: number;

	scrollView: ScrollView;
	maxScrollY: number;
}

interface State {
	scrollViewOffset: number;
	scrollViewOffsetForFlying: number;
}

export class PreviewMarkerList extends React.Component<Props, State> {
	carousel: Carousel<View>;

	constructor(props: Props) {
		super(props);

		this.state = {
			scrollViewOffset: 0,

			scrollViewOffsetForFlying: 0,
		};
	}

	// markers: Array<Marker> = [];

	scrollView: ScrollView;
	flying: View;
	renderMarkers() {
		let toRet = [];

		let markerDay = 1;
		let storedMarkers: Array<IMarker> = [];

		this.props.markers.forEach((marker, mi) => {
			if ((marker.logicFunction == "day" && mi > 0) || mi == this.props.markers.length - 1) {
				let cMarkerDay = markerDay;
				mi == this.props.markers.length - 1 && storedMarkers.push(marker);
				toRet.push(
					<View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
						<Text style={{ color: "#242424", fontSize: 18 }}>Day {cMarkerDay}</Text>
					</View>,
					<View>
						<Carousel
							inactiveSlideOpacity={1}
							keyboardShouldPersistTaps="always"
							data={storedMarkers}
							renderItem={({ item: { id, title, description, pictures, types } }) => {
								return (
									<TouchableOpacity
										style={{ width: d.width * 0.8, height: d.height * 0.3, flexDirection: "row", alignItems: "center", padding: 10 }}
										activeOpacity={1}
										onPress={() => {
											this.props.navigation.navigate("PreviewRouteMarkerScreen", {
												data: { markerId: marker.id, routeId: this.props.routeId, pictures, title, description},
											});
										}}
									>
										<View key={id} style={{ width: d.width * 0.75, height: d.height * 0.25, flexDirection: "row", alignItems: "center", borderRadius: 10, backgroundColor: "white", elevation: 2 }}>
											{pictures[0] && (
												<CachableImage
													data={this.props.data}
													imageProps={{
														source: null,
														style: { width: Math.round(d.width * 0.4), height: "100%", borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
														resizeMode: "cover",
													}}
													source={{ uri: `${config.host}/api/routeImages?route=${this.props.routeId}&image=${pictures[0]}`, headers: {} }}
												></CachableImage>
											)}
											<View style={{ backgroundColor: "white", width: "100%", minHeight: d.height * 0.25, flexDirection: "column", flex: 1, marginRight: "5%", justifyContent: "space-evenly", padding: "4%" }}>
												<Text style={{ color: "#242424", fontSize: 18, flex: 1, flexWrap: "wrap", width: "100%" }}>{title}</Text>
												<Text style={{ color: "#242424", fontSize: 14, flex: 2, flexWrap: "wrap" }}>{description.substr(0, description.substr(0, 110).lastIndexOf(" ")).concat(" ...")}</Text>
											</View>
										</View>
									</TouchableOpacity>
								);
							}}
							itemWidth={d.width * 0.8}
							sliderWidth={d.width}
							layout={"stack"}
							onSnapToItem={(si) => this.props.focusTo(cMarkerDay, si)}
							//@ts-ignore
							// slideInterpolatedStyle={(index, animatedValue, carouselProps) => {
							// 	const sizeRef = carouselProps.vertical ? carouselProps.itemHeight : carouselProps.itemWidth;
							// 	const translateProp = carouselProps.vertical ? "translateY" : "translateX";

							// 	return {
							// 		zIndex: carouselProps.data.length - index,
							// 		opacity: animatedValue.interpolate({
							// 			inputRange: [-1, 0, 1, 2],
							// 			outputRange: [0.75, 1, 0.6, 0.4],
							// 		}),
							// 		transform: [
							// 			{
							// 				rotate: animatedValue.interpolate({
							// 					inputRange: [-1, 0, 1, 2],
							// 					outputRange: ["0deg", "0deg", "5deg", "8deg"],
							// 					extrapolate: "clamp",
							// 				}),
							// 			},
							// 			{
							// 				scale: animatedValue.interpolate({
							// 					inputRange: [-1, 0, 1, 2],
							// 					outputRange: [0.96, 1, 0.85, 0.7],
							// 				}),
							// 			},
							// 			{
							// 				[translateProp]: animatedValue.interpolate({
							// 					inputRange: [-1, 0, 1, 2],
							// 					outputRange: [0, 0, -sizeRef + 30, -sizeRef * 2 + 45],
							// 					extrapolate: "clamp",
							// 				}),
							// 			},
							// 		],
							// 	};
							// }}
							// scrollInterpolator={(index, carouselProps) => {
							// 	const range = [2, 1, 0, -1];
							// 	const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
							// 	const outputRange = range;

							// 	return { inputRange, outputRange };
							// }}
							//horizontal
						/>
						{/*<View key={id} style={{ width: d.width * 0.8, height: d.height * 0.3, flexDirection: "row", alignItems: "center" }}>
										{pictures && pictures?.[0] && (
											<CachableImage
												data={this.props.data}
												imageProps={{
													source: null,
													style: { width: Math.round(d.width * 0.4), height: "100%" },
												}}
												source={{ uri: `${config.host}/api/routeImages?route=${this.props.routeId}&image=${pictures[0]}&form=cover`, headers: {} }}
											></CachableImage>
										)}
										<View style={{ backgroundColor: "white", width: "100%", minHeight: d.height * 0.15, flexDirection: "column", flex: 1, marginRight: "5%", elevation: 3, justifyContent: "space-around", padding: "4%" }}>
											<Text style={{ color: "#242424", fontSize: 18, flex: 1, flexWrap: "wrap" }}>{title}</Text>
											<Text style={{ color: "#242424", fontSize: 14, flex: 1, flexWrap: "wrap" }}>{description.substr(0,description.substr(0, 50).lastIndexOf(" ")).concat("...")}</Text>
											{/*<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
													{types && TypeToIcon[types[0]] && <Icon name={TypeToIcon[types[0]]} size={32} color="#242424" />}
													<Icon name="map-marker-distance" color="#242424" size={22} />
													<Text>{Math.round(distance)} m</Text>
											</View>//----}
										</View>
										</View>*/}
					</View>,
				);
				storedMarkers = [];
				markerDay++;
			} else if (!marker.isLogicMarker) {
				storedMarkers.push(marker);
			}
		});

		return toRet;
	}

	render() {
		if (!this.props.markers) return null;

		return <ScrollView style={{ paddingTop: "20%", paddingBottom: "20%" }}>{this.renderMarkers()}</ScrollView>;
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	marker: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",

		borderColor: "gray",
		borderWidth: 2,

		position: "absolute",
		width: "100%",

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
});

import React from "react";
import * as config from "../Config.json";
import { View, Text, Dimensions, PanResponder, PanResponderInstance } from "react-native";
import { AutoHeightImage } from "../Components/AutoHeightImage";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PreviewMap } from "../Components/PreviewMap";
import { PreviewMarkerList } from "../Components/PreviewMarkerList";
import { ScrollView, TouchableOpacity } from "react-native";

interface State extends IRoute {
	loaded: boolean;

	selectedDay: number;
	selectedMarker: number;

	scrollEnabled: boolean;

	maxScrollY: number;
	mapAbs: boolean;
}

export class RoutePreview extends React.Component<IProps, State> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			_id: "",

			loaded: false,

			selectedDay: 0,
			selectedMarker: -1,

			scrollEnabled: true,

			maxScrollY: 1000,
			mapAbs: false,
		};
	}

	loadingId: string;

	LoadRoute(id) {
		fetch(`${config.host}/api/getRouteData?id=${id}`, {
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((route) => {
				this.setState({ ...route, loaded: true });
			});
	}

	previewMarkerList: PreviewMarkerList;
	previewMap1: PreviewMap;
	previewMap2: PreviewMap;
	scrollView: ScrollView;

	PreviewMap: JSX.Element;
	render() {
		let id = this.props.navigation.getParam("id");
		if (id != this.state._id && id != this.loadingId) {
			this.loadingId = id;
			this.previewMap1 = null;
			this.previewMap2 = null;
			this.setState({ loaded: false });
			this.LoadRoute(id);
		}

		if (this.state._id && this.state.loaded) {
			return (
				<View style={{ backgroundColor: "#242424" }}>
					<View style={{ flexDirection: "row", width: "100%", height: 54, backgroundColor: "#242424", elevation: 5, paddingHorizontal: "2.5%", justifyContent: "flex-start", alignItems: "center" }}>
						<TouchableOpacity
							onPress={() => {
								this.props.navigation.goBack();
							}}
						>
							<Icon name="arrow-left" color="white" size={28} />
						</TouchableOpacity>
						<Text style={{ fontSize: 18, color: "white", marginLeft: "2.5%" }}>{this.state.title}</Text>
					</View>
					<ScrollView
						ref={(ref) => {
							this.scrollView = ref;
						}}
						style={{ backgroundColor: "white", zIndex: 1 }}
						bounces={false}
						onScroll={({
							nativeEvent: {
								contentOffset: { y },
							},
						}) => {
							if (y < this.state.maxScrollY && this.state.mapAbs) {
								this.setState({ mapAbs: false });
							}
							if (y > this.state.maxScrollY && !this.state.mapAbs) {
								this.setState({ mapAbs: true });
							}
						}}
						scrollEventThrottle={60}
						disableIntervalMomentum
					>
						<View
							onLayout={({
								nativeEvent: {
									layout: { height },
								},
							}) => {
								console.log(height);
								this.setState({ maxScrollY: height });
							}}
						>
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
										display: "flex",
									},
								}}
								width={d.width}
								data={this.props.data}
								cantUpdateCuzOfImageCacheBug
							></AutoHeightImage>

							<View style={{ padding: "5%" }}>
								<Text style={{ fontSize: 16 }}>{this.state.description}</Text>
							</View>
						</View>
						<PreviewMap selectedDay={this.state.selectedDay} selectedMarker={this.state.selectedMarker} path={this.state.path} routeId={this.state._id} markers={this.state.markers} ref={(ref) => (this.previewMap1 = ref)} markerList={this.previewMarkerList} data={this.props.data} navigation={this.props.navigation}></PreviewMap>
						<PreviewMarkerList
							focusTo={(selectedDay, selectedMarker) => {
								console.log("DAY SERT: " + selectedDay);
								this.setState({ selectedDay, selectedMarker });
								let positions = this.state.markers.slice(this.state.markers.findIndex(({day, logicFunction}) => logicFunction == "day" && day == selectedDay) + 1, this.state.markers.findIndex(({day, logicFunction}) => logicFunction == "day" && day == selectedDay + 1)).map(m => m.pos);
								this.previewMap1.MapView.fitToCoordinates(positions, { animated: false, edgePadding: { bottom: 100, left: 100, right: 100, top: 100 } })
								this.previewMap2.MapView.fitToCoordinates(positions, { animated: false, edgePadding: { bottom: 100, left: 100, right: 100, top: 100 } })
							}}
							scrollView={this.scrollView}
							maxScrollY={this.state.maxScrollY}
							selectedDay={this.state.selectedDay}
							routeId={this.state._id}
							markers={this.state.markers}
							data={this.props.data}
							navigation={this.props.navigation}
							ref={(ref) => (this.previewMarkerList = ref)}
							
						></PreviewMarkerList>
					</ScrollView>
					{(() => {
						console.log("STATEEEEEEEEE" + this.state.mapAbs);
					})()}
					<View style={{ position: "absolute", top: 54, left: 0, right: 0, zIndex: this.state.mapAbs ? 1 : 0 }}>
						<PreviewMap selectedDay={this.state.selectedDay} selectedMarker={this.state.selectedMarker} path={this.state.path} routeId={this.state._id} markers={this.state.markers} ref={(ref) => (this.previewMap2 = ref)} markerList={this.previewMarkerList} data={this.props.data} navigation={this.props.navigation}></PreviewMap>
					</View>
				</View>
			);
		}

		return null;
	}
}

const d = Dimensions.get("screen");

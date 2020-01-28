import React from "react";
import * as config from "../Config.json";
import { View, Text, Dimensions } from "react-native";
import { AutoHeightImage } from "../Components/AutoHeightImage";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PreviewMap } from "../Components/PreviewMap";
import { PreviewMarkerList } from "../Components/PreviewMarkerList";
import { ScrollView } from "react-native-gesture-handler";

interface State extends IRoute {
	loaded: boolean;

	selectedDay: number;
}

export class RoutePreview extends React.Component<IProps, State> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			_id: "",

			loaded: false,

			selectedDay: 0,
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
	previewMap: PreviewMap;
	render() {
		let id = this.props.navigation.getParam("id");
		if (id != this.state._id && id != this.loadingId) {
			this.loadingId = id;
			this.setState({ loaded: false });
			this.LoadRoute(id);
		}

		if (this.state._id && this.state.loaded)
			return (
				<ScrollView style={{ backgroundColor: "white" }}>
					<View style={{ flexDirection: "row", width: "100%", height: 54, backgroundColor: "#242424", elevation: 5, paddingHorizontal: "2.5%", justifyContent: "flex-start", alignItems: "center" }}>
						<Icon name="arrow-left" color="white" size={28} />
						<Text style={{ fontSize: 18, color: "white", marginLeft: "2.5%" }}>{this.state.title}</Text>
					</View>

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

					<Text>{this.state.description}</Text>

					<PreviewMap routeId={this.state._id} markers={this.state.markers} selectedDay={this.state.selectedDay} onDaySelect={(day) => {}} ref={(ref) => (this.previewMap = ref)} markerList={this.previewMarkerList} data={this.props.data} navigation={this.props.navigation}></PreviewMap>

					<PreviewMarkerList selectedDay={this.state.selectedDay} routeId={this.state._id} markers={this.state.markers} onDaySelect={(day) => {}} data={this.props.data} navigation={this.props.navigation} ref={(ref) => (this.previewMarkerList = ref)} Map={this.previewMap}></PreviewMarkerList>
				</ScrollView>
			);

		return null;
	}
}

const d = Dimensions.get("screen");

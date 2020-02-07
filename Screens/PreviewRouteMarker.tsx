import React from "react";
import * as config from "../Config.json";
import { View, Text, Dimensions, PanResponder, PanResponderInstance, StatusBar } from "react-native";
import { AutoHeightImage } from "../Components/AutoHeightImage";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PreviewMap } from "../Components/PreviewMap";
import { PreviewMarkerList } from "../Components/PreviewMarkerList";
import { ScrollView, TouchableOpacity } from "react-native";
import { CachableImage } from "../Components/CachableImage";
import Carousel from "react-native-snap-carousel";

interface State {
	markerId: string;
	routeId: string;
	pictures: Array<string>;
	title: string;
	description: string;
}

export class PreviewRouteMarker extends React.Component<IProps, State> {
	constructor(props: IProps) {
		super(props);
	}

	loadingId: string;
	render() {
		StatusBar.setTranslucent(false);
		StatusBar.setBackgroundColor("#242424");

		let data: State = this.props.navigation.getParam("data", {});

		return (
			<View>
				<View style={{ flexDirection: "row", width: "100%", height: 54, backgroundColor: "#242424", paddingHorizontal: "2.5%", justifyContent: "flex-start", alignItems: "center" }}>
					<TouchableOpacity
						onPress={() => {
							this.props.navigation.goBack();
						}}
					>
						<Icon name="arrow-left" color="white" size={28} />
					</TouchableOpacity>
					<Text style={{ fontSize: 18, color: "white", marginLeft: "2.5%" }}> {data.title}</Text>
				</View>

				
					<Text style={{margin: "2.5%", fontSize: 16}}>{data.description}</Text>

					<Carousel
						inactiveSlideOpacity={1}
						keyboardShouldPersistTaps="always"
						data={data.pictures}
						contentContainerCustomStyle={{ alignItems: "center", justifyContent: "center" }}
						renderItem={({ item }) => {
							return (
								<View style={{ width: "100%", maxHeight: "100%", alignItems: "center", justifyContent: "center" }}>
									<AutoHeightImage
										data={this.props.data}
										imageProps={{
											source: null,
											style: { width: "100%", height: "100%" },
											resizeMode: "contain",
										}}
										source={{ uri: `${config.host}/api/routeImages?route=${data.routeId}&image=${item}`, headers: {} }}
										width={d.width}
										parent={this}
									></AutoHeightImage>
								</View>
							);
						}}
						itemWidth={d.width}
						sliderWidth={d.width}
					/>
				
			</View>
		);
	}
}

const d = Dimensions.get("screen");

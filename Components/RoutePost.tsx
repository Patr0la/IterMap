import React from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput, Picker, PickerItem, ViewPropTypes, ActivityIndicator, ListViewBase, ListViewComponent, Dimensions } from "react-native";

import * as config from "../Config.json";
import { BetterImage } from "./BetterImage";
import { TraveledBy } from "./TraveledBy";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { CachableImage } from "./CachableImage";
interface Props extends IProps, IRoute {}

interface State extends IRoute {
	//title: string;
	//votes: string;

	width: number;
	height: number;
}
export class RoutePost extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			...props,
			width: 0,
			height: 0,
		};
	}
	componentDidMount() {
		Image.getSize(
			`${config.host}/api/routeImage?id=${this.props._id}`,
			(width, height) => {
				this.setState({
					width: d.width,
					height: height * (d.width / width),
				});
			},
			() => {},
		);
	}

	render() {
		return (
			<View>
				<View style={{ width: "100%", height: 4, backgroundColor: "#A4A4A4" }}></View>

				<View style={styles.header}>
					<Text style={styles.title}>{this.state.title}</Text>
					<Text style={styles.madeBy}> : by {this.state.creator}</Text>
					{this.state.creator == this.props.data.username && (
						<Text onPress={() => this.props.navigation.navigate("EditRoute", { id: this.state._id })} style={{ marginRight: 10 }}>
							<Icon name="dots-vertical" size={24} color="white" />
						</Text>
					)}
				</View>

				<CachableImage
					source={{
						uri: `${config.host}/api/routeImage?id=${this.props._id}`,
						//TODO get headers
					}}
					data={this.props.data}
				></CachableImage>
				{
					<Image
						source={{
							uri: `${config.host}/api/routeImage?id=${this.props._id}`,
							//TODO get headers
						}}
						resizeMethod="auto"
						resizeMode="contain"
						style={{
							width: this.state.width,
							height: this.state.height,
							alignSelf: "stretch",
						}}
						width={d.width} // height will be calculated automatically
					></Image>
				}

				{/*<BetterImage imageSource="web" parentViewStyle={{ height: 360, width: "100%" }} imageStyle={styles.image} data={this.props.data} navigation={this.props.navigation} url={`${config.host}/api/routeImage?id=${this.props._id}`}></BetterImage>*/}

				<View style={{ width: "100%", height: 4, backgroundColor: "#242424" }}></View>

				<View style={styles.info}>
					<Text>
						{this.state.score} <Icon name="star" size={24} />
					</Text>
					<Text>
						{this.state.uses} <Icon name="eye-outline" size={24} />
					</Text>
					<Text>
						{this.state.travelTime} <Icon name="clock-outline" size={24} />
					</Text>
					<Text>
						{this.state.cost} <Icon name="cash-multiple" size={24} />
					</Text>

					<TraveledBy traveledBy={this.state.traveledBy}> </TraveledBy>
				</View>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	view: {
		//height: 360,
		display: "flex",
		flexDirection: "column",
		width: "100%",
		marginTop: "10%",
		backgroundColor: "#676767",
	},
	title: {
		fontFamily: "DejaVuSerif-Bold",
		fontSize: 24,
		color: "white",
		marginLeft: 10,
	},
	madeBy: {
		fontFamily: "DejaVuSerif",
		color: "#aaaaaa",
		fontSize: 18,
		marginTop: 6,
		flexGrow: 1,
	},
	image: {
		//position: "absolute",
		//left: 0,
		//right: 0,
		//top: 0,
		//bottom: 0,
		width: "100%",
		height: "100%",
	},
	header: {
		display: "flex",
		//position: "absolute",
		justifyContent: "space-between",
		flexDirection: "row",
	},
	info: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row",
		height: 100,
		backgroundColor: "red",
		width: "100%",
	},
});

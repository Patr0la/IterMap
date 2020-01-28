import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as config from "../Config.json";
import { AutoHeightImage } from "./AutoHeightImage";
import { TraveledBy } from "./TraveledBy";
import { CachableImage } from "./CachableImage";
import { TouchableOpacity } from "react-native-gesture-handler";

interface Props extends IProps, IRoute {}

interface State extends IRoute {
	//title: string;
	//votes: string;

	width: number;
	height: number;

	routeMenuOpen: boolean;
}
export class RoutePost extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			...props,
			width: 0,
			height: 0,

			routeMenuOpen: false,
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
			<View
				style={{ backgroundColor: "#323232" }}
				onLayout={(e) => {
					console.table(e.nativeEvent.layout);
				}}
			>
				<View style={styles.header}>
					<TouchableOpacity
						style={{ backgroundColor: "#323232" }}
						activeOpacity={1}
						onPress={() => {
							console.log("NAVIGATING TO ROUTE PREVIRE");
							this.props.navigation.navigate("RoutePreviewScreen", { id: this.state._id });
						}}
					>
						<View style={{ alignItems: "center", flexDirection: "row", alignContent: "center" }}>
							<Text style={styles.title}>{this.state.title}</Text>
							<Text style={styles.madeBy}> : by {this.state.creator}</Text>
						</View>
					</TouchableOpacity>
					{this.state.creator == this.props.data.username && (
						<TouchableOpacity
							onLayout={(e) => {
								console.table(e.nativeEvent.layout);
							}}
							onPress={() => this.props.navigation.navigate("EditRoute", { id: this.state._id })}
							style={{ marginRight: 10 }}
						>
							<Icon name="dots-vertical" size={24} color="white" />
						</TouchableOpacity>
					)}
				</View>

				<TouchableOpacity
					style={{ backgroundColor: "#323232" }}
					activeOpacity={1}
					onPress={() => {
						console.log("NAVIGATING TO ROUTE PREVIRE");
						this.props.navigation.navigate("RoutePreviewScreen", { id: this.state._id });
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
								backgroundColor: "#323232",
								display: "flex",
							},
						}}
						width={d.width}
						data={this.props.data}
						cantUpdateCuzOfImageCacheBug
					></AutoHeightImage>
				</TouchableOpacity>

				{/*
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
					></Image>*/}

				{/*<BetterImage imageSource="web" parentViewStyle={{ height: 360, width: "100%" }} imageStyle={styles.image} data={this.props.data} navigation={this.props.navigation} url={`${config.host}/api/routeImage?id=${this.props._id}`}></BetterImage>*/}

				<TouchableOpacity
					style={{ backgroundColor: "#323232" }}
					activeOpacity={1}
					onPress={() => {
						console.log("NAVIGATING TO ROUTE PREVIRE");
						this.props.navigation.navigate("RoutePreviewScreen", { id: this.state._id });
					}}
				>
					<View style={styles.info}>
						<View style={styles.infoPart}>
							<Text style={styles.text}>{this.state.score} </Text>
							<Icon name="star" size={24} color="white" />
						</View>
						<View style={styles.infoPart}>
							<Text style={styles.text}>{this.state.uses} </Text>
							<Icon name="eye-check" size={24} color="white" />
						</View>
						{this.state.days && (
							<View style={styles.infoPart}>
								<Text style={styles.text}>{this.state.days} </Text>
								<Icon name="calendar-today" size={24} color="white" />
							</View>
						)}
						{this.state.cost ? (
							<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
								<Text style={styles.text}>{this.state.cost.value} </Text>
								{this.state.cost.currency != "Local" ? <Text style={styles.text}>{this.state.cost.currency}</Text> : <Icon name="cash-multiple" size={24} color="white" />}
							</View>
						) : null}

						<TraveledBy traveledBy={this.state.traveledBy}> </TraveledBy>
					</View>
				</TouchableOpacity>
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
		backgroundColor: "#a4a4a4",
	},
	title: {
		fontFamily: "DejaVuSerif-Bold",
		fontSize: 20,
		color: "white",
		marginLeft: 10,
	},
	madeBy: {
		fontFamily: "DejaVuSerif",
		color: "#aaaaaa",
		fontSize: 14,
		marginTop: 3,
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
		minHeight: d.height * 0.05,
		alignItems: "center",
	},
	info: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row",
		alignItems: "center",
		alignContent: "center",
		minHeight: d.height * 0.05,
		backgroundColor: "#323232",
		width: "100%",
		color: "white",
		paddingHorizontal: "2.5%",
	},
	infoPart: {
		justifyContent: "center",
		flexDirection: "row",
		alignItems: "center",
	},
	text: {
		color: "white",
	},
});

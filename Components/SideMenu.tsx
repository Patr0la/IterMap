import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as config from "../Config.json";
import { BetterImage } from "./BetterImage";

interface IState {
	loaded: boolean;

	score: number;
	numberOfRoutes: number;
}

export class SideMenu extends React.Component<IProps, IState> {
	constructor(props) {
		super(props);

		// this.shouldComponentUpdate.bind(this);

		this.state = {
			loaded: false,
			score: -1,
			numberOfRoutes: -1,
		};

		if (this.props.data.username) {
			fetch(`${config.host}/api/myProfileInfo`, {
				headers: {
					Accept: "application/json",
					Cookie: `session=${this.props.data.token}`,
					"Content-Type": "application/json",
				},
			})
				.then((res) => res.json())
				.then((profileInfo) => {
					this.setState({ score: profileInfo?.score });

					fetch(`${config.host}/api/getMyRoutes`, {
						headers: {
							Accept: "application/json",
							Cookie: `session=${this.props.data.token}`,
							"Content-Type": "application/json",
						},
					})
						.then((res) => res.json())
						.then((routesData) => {
							console.log(routesData);
							console.log("WTRFDDAHJGFHDGSJFGSDJhj");
							console.log(routesData.length);
							this.setState({ numberOfRoutes: routesData?.length });
						})
						.catch((reason) => {});
				})
				.catch((reason) => {});
		}
	}

	navigateTo(route: string) {
		this.props.navigation.navigate({ routeName: route });
	}

	// shouldComponentUpdate(nextProps, nextState) {
	// 	return !this.state.loaded;
	// }

	render() {
		return (
			<View style={styles.container} onLayout={() => this.setState({ loaded: true })}>
				<View>
					{/*
                    TODO better implementation of Cacgeable image
                */}
					{/*<BetterImage parentViewStyle={styles.proifleImageParent} imageStyle={styles.profileImage} imageSource="web" url={`${config.host}/api/profilePic?u=${this.props.data}`} cacheImage data={this.props.data} navigation={this.props.navigation}>
			</BetterImage>*/}
					<Icon name="account" size={128} color="#aaaa" style={styles.profileImage}/>

					<Text style={{ alignSelf: "center", fontSize: 16, color: "white" }}>{this.props.data.username}</Text>

					<View style={styles.row}>
						<Icon name="map" size={32} color="white" />
						<Text style={{ fontSize: 16, color: "white" }}>{this.state.numberOfRoutes}</Text>
						<View style={{ backgroundColor: "#aaaaaa", height: 30, width: 1 }} />
						<Text style={{ fontSize: 16, color: "white" }}>{this.state.score}</Text>
						<Icon name="arrow-up-bold-hexagon-outline" size={32} color="#ad0a4c" />
					</View>

					<View style={{ backgroundColor: "#aaaaaa", width: "80%", height: 1, marginLeft: "10%", marginTop: "4%", marginBottom: "5%" }} />

					<TouchableOpacity onPress={() => this.navigateTo("Home")} style={styles.touchableRow}>
						<Icon name="home" size={22} color="#aaaaaa" />
						<Text style={{ marginLeft: "5%", fontSize: 16, color: "white" }}>Home</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => this.navigateTo("Profile")} style={styles.touchableRow}>
						<Icon name="account" size={22} color="#aaaaaa" />
						<Text style={{ marginLeft: "5%", fontSize: 16, color: "white" }}>My profile</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => this.navigateTo("LiveRouteCreation")} style={styles.touchableRow}>
						<Icon name="crosshairs-gps" size={22} color="#aaaaaa" />
						<Text style={{ marginLeft: "5%", fontSize: 16, color: "white" }}>Live routes</Text>
					</TouchableOpacity>

					{this.props.data.liveRoutesTracking && (
						<TouchableOpacity onPress={() => this.navigateTo("Camera")} style={styles.touchableRow}>
							<Icon name="camera" size={22} color="#aaaaaa" />
							<Text style={{ marginLeft: "5%", fontSize: 16, color: "white" }}>Camera</Text>
						</TouchableOpacity>
					)}

					<TouchableOpacity
						onPress={() => {
							fetch(`${config.host}/api/newRoute`, {
								method: "POST",
								headers: {
									Accept: "application/json",
									Cookie: `session=${this.props.data.token}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									name: "Route " + new Date().toLocaleDateString(),
								}),
							})
								.then((res) => res.json())
								.then((res) => {
									this.props.navigation.navigate("EditRoute", { id: res.id });
								});
						}}
						style={{ ...styles.touchableRow }}
					>
						<Icon name="plus" size={22} color="#aaaaaa" />
						<Text style={{ marginLeft: "5%", fontSize: 16, color: "white" }}>Create new route</Text>
					</TouchableOpacity>
				</View>

				<View style={{ ...styles.row, marginBottom: "2.5%", justifyContent: "space-between" }}>
					<TouchableOpacity onPress={() => this.navigateTo("Logout")} style={{ flexDirection: "row", alignItems: "center" }}>
						<Icon name="exit-to-app" size={22} color="#aaaaaa" />
						<Text style={{ marginLeft: "5%", fontSize: 16, color: "white" }}>Logout</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => this.navigateTo("Settings")} style={{ flexDirection: "row", alignItems: "center" }}>
						<Icon name="settings" size={22} color="#aaaaaa" />
						<Text style={{ marginLeft: "5%", fontSize: 16, color: "white" }}>Settings</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		flexDirection: "column",
		backgroundColor: "#242424",
		flex: 1,
		justifyContent: "space-between",
	},
	proifleImageParent: {
		width: "100%",
		height: d.height * 0.2,
		justifyContent: "center",
		//flexDirection: "row",
		alignItems: "center",
	},
	profileImage: {
		width: 128,
		height: 128,
		borderRadius: 64,
		alignSelf: "center"
	},
	touchableRow: {
		backgroundColor: "#242424",
		width: "80%",
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "center",
		justifyContent: "flex-start",
		paddingTop: 10,
		paddingBottom: 10,
	},
	row: {
		width: "80%",
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "center",
		justifyContent: "space-evenly",
		marginTop: 10,
	},
	footer: {
		flex: 1,
		alignSelf: "flex-end",
		marginBottom: "5%",
	},
});

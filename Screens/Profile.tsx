import React from "react";
import { Dimensions, StyleSheet, Text, View, Keyboard } from "react-native";
import { TouchableOpacity, ScrollView, TextInput } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { PageNavigator } from "../Components/PageNavigator";
import { RoutesPreview } from "../Components/RoutesPreview";
import * as config from "../Config.json";
import { RoutePost } from "../Components/RoutePost";

interface State extends IProfileEntry {
	routesData?: Array<IRoute>;

	refreshing?: boolean;

	viewing: "routes" | "about";

	descriptionOpen: boolean;
}

export class Profile extends React.Component<IProps, State> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			viewing: "about",

			descriptionOpen: false,
		};
	}

	loadData() {
		fetch(this.loadedUsername == this.props.data.username ? `${config.host}/api/myProfileInfo` : `${config.host}/api/userProfileInfo?username=${this.loadedUsername}`, {
			headers: {
				Accept: "application/json",
				Cookie: `session=${this.props.data.token}`,
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((profileInfo) => {
				this.setState({ ...profileInfo });

				fetch(this.loadedUsername == this.props.data.username ? `${config.host}/api/getMyRoutes` : `${config.host}/api/getUserRoutes?username=${this.loadedUsername}`, {
					headers: {
						Accept: "application/json",
						Cookie: `session=${this.props.data.token}`,
						"Content-Type": "application/json",
					},
				})
					.then((res) => res.json())
					.then((routesData) => {
						console.log(routesData);
						this.setState({ routesData, refreshing: false });
					})
					.catch((reason) => {
						this.setState({ refreshing: false });
						console.log(reason);
					});
			})
			.catch((reason) => {
				this.setState({ refreshing: false });
				console.log(reason);
			});
	}

	loadedUsername: string;
	Searchbar;
	render() {
		console.table(this.props.navigation.getParam("mandatoryRefresh", false));
		let username = this.props.navigation.getParam("username", this.props.data.username);
		if (username != this.loadedUsername) {
			this.loadedUsername = username;
			this.loadData();
		}

		let dt = (new Date().getTime() - this.state.joined) / 1000;
		let weeks = Math.floor(dt / 604800);
		let months = Math.floor(dt / 2629743);
		let years = Math.floor(dt / 31556926);

		let usedFor = years >= 1 ? `${years} years ${months} months` : months > 1 ? `${months} months` : `${weeks} weeks`;
		return (
			<View style={{ backgroundColor: "#242424", width: "100%", height: "100%" }}>
				{/*<Search
                    placeHolder="Search for routes"
                    ref={ref => (this.Searchbar = ref)}
                    endpoint="findRoutes"
                    menu
                    navigation={this.props.navigation}
                    data={this.props.data}
                    onSelectCallback={selection => {
                        console.log(selection); // TODO Navigate to thism
                    }}
				/>*/}
				<View style={{ flexDirection: "row", width: "100%", height: 54, backgroundColor: "#242424", paddingHorizontal: "2.5%", justifyContent: "flex-start", alignItems: "center" }}>
					<TouchableOpacity
						onPress={() => {
							this.props.navigation.goBack();
						}}
					>
						<Icon name="arrow-left" color="white" size={28} />
					</TouchableOpacity>
					<Text style={{ fontSize: 18, color: "white", marginLeft: "2.5%" }}> @ {this.state.username}</Text>
				</View>

				<PageNavigator
					default="about"
					routes={[
						{ title: "About", value: "about" },
						{ title: "Routes", value: "routes" },
					]}
					onSelectionChange={(viewing) => this.setState({ viewing })}
				/>

				{this.state.viewing == "about" ? (
					<ScrollView style={{ width: "100%", backgroundColor: "#323232" }}>
						<View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: "2.5%" }}>
							{this.state.username == this.props.data.username ? <TextInput value={this.state.description} placeholder={"Description:"} placeholderTextColor="#aaaaaa" style={{ color: "white", margin: "2.5%", flex: 1 }} onChangeText={(description) => this.setState({ description })} onFocus={() => this.setState({ descriptionOpen: true })} /> : this.state.description ? <Text style={styles.text}>{this.state.description}</Text> : null}
							{this.state.descriptionOpen && (
								<TouchableOpacity
									onPress={() => {
										Keyboard.dismiss();
										this.setState({ descriptionOpen: false });
										fetch(`${config.host}/api/setProfileDescription`, {
											headers: {
												Accept: "application/json",
												Cookie: `session=${this.props.data.token}`,
												"Content-Type": "application/json",
											},
											method: "POST",
											body: JSON.stringify({ description: this.state.description }),
										})
											.then((res) => res.json())
											.then((route) => {});
									}}
								>
									<Icon name="check" size={28} color="white" />
								</TouchableOpacity>
							)}
						</View>

						<View style={{ width: "100%", height: d.height * 0.1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
							<View style={{ flexDirection: "row", alignItems: "center" }}>
								<Text style={styles.text}> User for: {usedFor}</Text>
								<Icon name="timer-sand" size={32} color="white" />
							</View>
							<View style={{ flexDirection: "row", alignItems: "center" }}>
								{this.state.routesData?.length && <Text style={styles.text}> Routes created: {this.state.routesData.length} </Text>}
								<Icon name="map" size={32} color="white" />
							</View>
						</View>
						<View style={{ flexDirection: "row", alignItems: "center", width: "100%", justifyContent: "center", marginBottom: "5%" }}>
							<Text style={styles.text}>Total Score: {this.state.score} </Text>
							<Icon name="arrow-up-bold-hexagon-outline" size={32} color="#ad0a4c" />
						</View>

						{this.state.favoriteRoute && (
							<View style={{ backgroundColor: "#242424", marginVertical: "5%" }}>
								<Text style={{ ...styles.text, margin: "2.5%" }}> Favorite Route:</Text>
								<RoutePost {...this.state.favoriteRoute} navigation={this.props.navigation} data={this.props.data} parent={this}></RoutePost>
							</View>
						)}
						<View style={{ backgroundColor: "#242424", height: d.height * 0.3 }}></View>
					</ScrollView>
				) : (
					<View>{this.state.routesData && <RoutesPreview routeData={this.state.routesData} navigation={this.props.navigation} data={this.props.data}></RoutesPreview>}</View>
				)}
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#242424",
		color: "white",
		justifyContent: "center",
		borderBottomWidth: 4,
	},
	buttonText: {
		width: d.width / 2,
		fontSize: 16,
		lineHeight: 16,
		height: 44,
		color: "white",
		textAlignVertical: "center",
		textAlign: "center",
		fontWeight: "bold",
	},

	container: {
		flex: 1,
		backgroundColor: "#fff",
		//alignItems: "center",
		//justifyContent: "center",
		height: "100%",
	},
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
	header: {
		display: "flex",
		//position: "absolute",
		justifyContent: "space-between",
		flexDirection: "row",
		minHeight: d.height * 0.05,
		alignItems: "center",
		backgroundColor: "#242424",
	},
	text: {
		color: "white",
		fontSize: 16,
	},
});

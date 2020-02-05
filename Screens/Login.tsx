import React from "react";
import { AsyncStorage, Button, Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { CachableImage } from "../Components/CachableImage";
import * as config from "../Config.json";
import { AutoHeightImage } from "../Components/AutoHeightImage";

const sha = require("../sha");

interface Props extends IProps {}

interface State {
	username: string;
	password: string;
}

export class Login extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.login = this.login.bind(this);
	}

	login() {
		if (!this.state.username || !this.state.password) {
			alert("Input username and password."); // STYLE improve
			return;
		}

		const password = sha.sha512(this.state.password);

		fetch(`${config.host}/api/login`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: this.state.username,
				password: password,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.token) {
					AsyncStorage.setItem("token", res.token, (err) => {
						if (err) {
							alert("Unable to access device storage.");
							return;
						}
						this.props.navigation.navigate("Home");
					});
				} else {
					// alert("TODO"); //TODO Make error handling
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

	render() {
		return (
			<View style={{ height: d.height, flexDirection: "column", justifyContent: "space-between" }}>
				{/*<Text style={{ color: "#242424", fontSize: 16 }}>Welcom to Iter, you new best sightseeing friend!</Text>*/}

				<View style={styles.container}>
					<Text style={{ fontSize: 22, color: "#242424", marginTop: "10%", height: d.height * 0.1 }}>Login or create account to continue.</Text>
					<View style={{ width: "100%", padding: "5%", height: d.height * 0.2 }}>
						<TextInput style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="Username" placeholderTextColor="#242424" onChangeText={(username) => this.setState({ username })}></TextInput>
						<TextInput style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="Password" secureTextEntry placeholderTextColor="#242424" onChangeText={(password) => this.setState({ password })}></TextInput>
					</View>
					<View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
						<View style={{ flex: 10 }}></View>
						<View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", flexGrow: 0 }}>
							<Button title={"Login"} onPress={this.login} color="#ad0a4c"></Button>
							<Button title="Register" onPress={() => this.props.navigation.navigate("Register")} color="#ad0a4c"></Button>
							<Button title="Forgot password" onPress={() => this.props.navigation.navigate("ForgotPasswordScreen")} color="#ad0a4c"></Button>
						</View>
					</View>
				</View>

				<View>
					<AutoHeightImage
						source={{
							uri: `${config.host}/banner.png`,
							headers: {},
						}}
						data={this.props.data}
						imageProps={{
							source: null,
						}}
						width={d.width}
						parent={this}
					></AutoHeightImage>
					<View style={{ height: d.height * 0.1, width: "100%", backgroundColor: "#aaaaaa" }}></View>
				</View>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "flex-start",
		height: d.height,
	},
});

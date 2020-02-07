import React from "react";
import { AsyncStorage, Button, Dimensions, Text, TextInput, View, Alert } from "react-native";
import { Switch } from "react-native-gesture-handler";
import { CachableImage } from "../Components/CachableImage";
import * as config from "../Config.json";
import { AutoHeightImage } from "../Components/AutoHeightImage";

//import { DataKeys } from "../Helper";
const sha = require("../sha");

interface Props extends IProps {}

interface State {
	username?: string;
	password1?: string;
	password2?: string;
	passwordsMatch?: boolean;
	email?: string;
	licenseAccepted: boolean;
}

export class Register extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		//this.state = { passwordsMatch : true }

		this.register = this.register.bind(this);

		this.state = {
			licenseAccepted: false,
			passwordsMatch: false,
		};
	}

	register() {
		if (!this.state.username) return Alert.alert("", "Username is required.");
		if (!this.state.password1) return Alert.alert("", "Password is required.");
		if (this.state.password1.length < 8 ) return Alert.alert("", "Should be at least 8 characters long.");
		if (!this.state.passwordsMatch) return Alert.alert("", "Passwords do not match.");
		if (!this.state.email) return Alert.alert("", "Email is required.");
		if (!this.state.licenseAccepted) return Alert.alert("", "You have to accept licence.");

		const password = sha.sha512(this.state.password1);

		fetch(`${config.host}/api/register`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: this.state.username,
				password: password,
				email: this.state.email,
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

				<View style={{ backgroundColor: "white", alignItems: "center", justifyContent: "flex-start", flex: 1, width: "100%" }}>
					<Text style={{ fontSize: 22, color: "#242424", marginTop: "10%" }}>Create account.</Text>
					<View style={{ width: "100%", padding: "5%" }}>
						<TextInput autoCapitalize="none" style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="Username" placeholderTextColor="#aaaaaa" onChangeText={(username) => this.setState({ username })}></TextInput>
						<TextInput
							style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }}
							placeholderTextColor="#aaaaaa"
							placeholder="Password"
							onChangeText={(password1) => {
								this.setState({ password1, passwordsMatch: password1 == this.state.password2 });
							}}
							secureTextEntry
							autoCapitalize="none"
						></TextInput>
						<TextInput
							style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }}
							placeholderTextColor="#aaaaaa"
							placeholder="Confirm Password"
							onChangeText={(password2) => {
								this.setState({ password2, passwordsMatch: this.state.password1 == password2 });
							}}
							secureTextEntry
							autoCapitalize="none"
						></TextInput>
						<TextInput autoCapitalize="none" style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholderTextColor="#aaaaaa" placeholder="E-mail" onChangeText={(email) => this.setState({ email })}></TextInput>
						<View style={{ width: "100%", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
							<Text>I accept license aggreement:</Text>
							<Switch style={{ margin: "5%" }} thumbColor="#242424" trackColor={{ false: "#aaaaaa", true: "#ad0a4c" }} onValueChange={(licenseAccepted) => this.setState({ licenseAccepted })} value={this.state.licenseAccepted}></Switch>
						</View>
					</View>
					<View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", alignContent: "center", alignItems: "center" }}>
						<Button title="Create account" onPress={this.register} color="#ad0a4c"></Button>
						<Text style={{ color: "#aaaaaa" }}></Text>
						<Button title="Back to login" onPress={() => this.props.navigation.navigate("Login")} color="#ad0a4c"></Button>
					</View>
				</View>

				<AutoHeightImage
					source={{
						uri: `${config.host}/banner2.png`,
						headers: {},
					}}
					data={this.props.data}
					imageProps={{
						source: null,
						style: {
							marginBottom: d.height * 0.1,
						},
					}}
					width={d.width}
					parent={this}
				></AutoHeightImage>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

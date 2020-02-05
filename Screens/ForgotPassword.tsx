import React from "react";
import { AsyncStorage, Button, Dimensions, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { CachableImage } from "../Components/CachableImage";
import * as config from "../Config.json";

const sha = require("../sha");

interface Props extends IProps {}

interface State {
	email?: string;

	sent?: boolean;
	sending?: boolean;

	resetCode?: string;

	password1?: string;
	password2?: string;
	passwordsMatch?: boolean;

	success?: boolean;
}

export class ForgotPassword extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	sendResetMail() {
		if (!this.state.email || !this.state.email) return alert("Email is required.");

		this.setState({ sending: true });

		fetch(`${config.host}/api/forgotPassword`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: this.state.email,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				this.setState({ sending: false, sent: true });
			})
			.catch((err) => {
				console.log(err);
				this.setState({ sending: false });
			});
	}

	resetPassword() {
		if (!this.state.password1) return alert("Password is required.");
		if (!this.state.passwordsMatch) return alert("Passwords do not match.");

		const password = sha.sha512(this.state.password1);

		fetch(`${config.host}/api/resetPaassword`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: this.state.email,
				code: this.state.resetCode,
				password,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				console.log(res);
				if (res) {
					this.setState({ success: true });
				}
			})
			.catch((err) => {
                console.log(err)
			});
	}

	render() {
		console.table(this.state);
		if (this.state.success)
			return (
				<View style={styles.container}>
					<Text style={{ fontSize: 22, color: "#242424", marginTop: "10%", height: d.height * 0.1 }}>Successfully updated password.</Text>
					<Text style={{ fontSize: 18, color: "#242424", marginTop: "10%", height: d.height * 0.1 }}>You can now head to the login page!</Text>
					<View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: d.height * 0.05 }}>
						<View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", flexGrow: 0 }}>
							<Button title="Login"  onPress={() => this.props.navigation.goBack()} color="#ad0a4c"></Button>
						</View>
					</View>
				</View>
			);

		if (this.state.sending)
			return (
				<View>
					<ActivityIndicator color="#ad0a4c" animating={true} />
				</View>
			);

		if (this.state.sent)
			return (
				<View style={styles.container}>
					{/*<Text style={{ color: "#242424", fontSize: 16 }}>Welcom to Iter, you new best sightseeing friend!</Text>*/}

					<Text style={{ fontSize: 22, color: "#242424", marginTop: "10%", height: d.height * 0.1 }}>Email sent.</Text>
					<Text style={{ fontSize: 18, color: "#242424", marginTop: "10%", height: d.height * 0.1 }}>You should have recieved an e-mail with reset code which is valid for 5 minutes. You have to enter reset code here:</Text>

					<View style={{ width: "100%", padding: "5%", height: d.height * 0.2 }}>
						<TextInput style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="Reset code" placeholderTextColor="#242424" onChangeText={(resetCode) => this.setState({ resetCode })} autoCapitalize={"none"} keyboardType={"numeric"}></TextInput>

						<TextInput
							style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }}
							placeholderTextColor="#242424"
							placeholder="Password"
							onChangeText={(password1) => {
								this.setState({ password1, passwordsMatch: password1 == this.state.password2 });
							}}
							secureTextEntry
							autoCapitalize="none"
						></TextInput>
						<TextInput
							style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }}
							placeholderTextColor="#242424"
							placeholder="Confirm Password"
							onChangeText={(password2) => {
								this.setState({ password2, passwordsMatch: this.state.password1 == password2 });
							}}
							secureTextEntry
							autoCapitalize="none"
						></TextInput>
					</View>

					<View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: d.height * 0.05 }}>
						<View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", flexGrow: 0 }}>
							<Button title="Reset password" onPress={() => this.resetPassword()} color="#ad0a4c"></Button>
						</View>
					</View>
					<Text style={{ fontSize: 18, color: "#242424", marginTop: d.height * 0.05, height: d.height * 0.1 }}>You should also check your spam, but if there is nothing there, you can try again:</Text>
					<View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", flexGrow: 0 }}>
						<Button title="Send again" onPress={() => this.props.navigation.goBack()} color="#ad0a4c"></Button>
					</View>
				</View>
			);

		return (
			<View style={styles.container}>
				{/*<Text style={{ color: "#242424", fontSize: 16 }}>Welcom to Iter, you new best sightseeing friend!</Text>*/}

				<Text style={{ fontSize: 22, color: "#242424", marginTop: "10%", height: d.height * 0.1 }}>Enter e-mail to continue.</Text>
				<View style={{ width: "100%", padding: "5%", height: d.height * 0.2 }}>
					<TextInput style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="E-mail" placeholderTextColor="#242424" onChangeText={(email) => this.setState({ email })} autoCapitalize={"none"} value={this.state.email}></TextInput>
				</View>
				<View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
					<View style={{ flex: 10 }}></View>
					<View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", flexGrow: 0 }}>
						<Button title="Back to login" onPress={() => this.props.navigation.goBack()} color="#ad0a4c"></Button>
						<Button title="Reset password" onPress={() => this.sendResetMail()} color="#ad0a4c"></Button>
					</View>
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
		height: "100%",
		padding: "2.5%",
	},
});

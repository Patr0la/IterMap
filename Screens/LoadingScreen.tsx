import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { LoadingElement } from "../Components/LoadingElement";

interface State {}

export class LoadingScreen extends React.Component<IProps, State> {
	constructor(props: IProps) {
		super(props);

		let canNavigateToHome = false;
		let goneHome = false;
		props.data.initilize(
			() => {
				if (props.data.token) {
					setTimeout(() => {
						console.log("reeee");
						props.navigation.navigate("Home");
					}, 1000);
					console.log("UGH");

					goneHome = true;
				} else {
					props.navigation.navigate("Login");
				}
			},
			() => {
				console.log("Loaction setup");
			},
		);
	}

	render() {
		// return <View></View>
		return (
			<View style={styles.container}>
				<LoadingElement height={22} width={30} scale={3} animating={true} strokeColor="#ad0a4c" fill="#242424"></LoadingElement>
				<Text style={{ fontSize: 100, color: "#242424" }}>ter</Text>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	container: {
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center",
		height: d.height,
		width: d.width,
		flexDirection: "row",
	},
});

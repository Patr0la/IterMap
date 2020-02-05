import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
interface Props {
	navigate: (screen: string) => void;
}

interface State {}

export class Logout extends React.Component<Props, State> {
	render() {
		return (
			<View style={{ backgroundColor: "white", flex: 1 }}>
				<View style={styles.container}>
					<Text style={{ color: "#242424", fontSize: 24 }}>Are you sure you want to log out?</Text>
					<View style={{ flexDirection: "row", width: "100%", justifyContent: "space-evenly" }}>
						<Button title="Back" onPress={() => this.props.navigate("Home")} color="#ad0a4c"></Button>
						<Button
							title="Logout"
							onPress={() => {
								AsyncStorage.clear((err) => {
									if (err) alert("Unknown error");
									this.props.navigate("Login");
								});
							}}
							color="#ad0a4c"
						></Button>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "space-evenly",
		flexDirection: "column",
		height: "50%",
		padding: "5%",
	},
});

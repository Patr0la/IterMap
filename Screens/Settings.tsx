import React from "react";
import { StyleSheet, Text, View, Dimensions, Button, Linking } from "react-native";
import { TouchableOpacity, TextInput } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
interface Props extends IProps {}

interface State {}

export class Settings extends React.Component<Props, State> {
	render() {
		return (
			<View style={{ flex: 1, backgroundColor: "white" }}>
				<View style={{ flexDirection: "row", width: "100%", height: 54, backgroundColor: "#242424", elevation: 5, paddingHorizontal: "2.5%", justifyContent: "flex-start", alignItems: "center" }}>
					<TouchableOpacity
						onPress={() => {
							this.props.navigation.goBack();
						}}
					>
						<Icon name="arrow-left" color="white" size={28} />
					</TouchableOpacity>
					<Text style={{ fontSize: 18, color: "white", marginLeft: "2.5%" }}>Settings</Text>
				</View>
				<View style={styles.container}>
					<Text style={{ fontSize: 18, marginLeft: "2.5%" }}>Account</Text>
					<View style={{ padding: "5%" }}>
						<Button onPress={() => this.props.navigation.navigate("ChanePassword")} title="Change password" color="#ad0a4c" />
					</View>
					<Text style={{ fontSize: 18, margin: "5%", marginLeft: "2.5%" }}>Live routes</Text>
					<View style={{ paddingLeft: "5%", alignItems: "center" }}>
						<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
							<Text style={{ fontSize: 16, marginLeft: "2.5%" }}>Update rate</Text>
							<TextInput value={this.props.data.liveRouteUpdateRate?.toString() ?? "10"} style={{ flex: 1, textAlign: "right", borderBottomColor: "#ad0a4c", borderBottomWidth: 1 }} />
							<Text style={{ fontSize: 16, marginLeft: "2.5%" }}>seconds</Text>
						</View>
						<Text style={{ fontSize: 16, marginLeft: "2.5%" }}>How often live route position update, lower number increases battery life, but decreases prevision</Text>
					</View>

					<Text style={{ fontSize: 18, margin: "5%", marginLeft: "2.5%" }}>About</Text>
					<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", paddingHorizontal: "2.5%" }}>
						<Text style={{ fontSize: 16 }}> Version: 1.0.0</Text>
						<Button onPress={() => Linking.openURL("mailto:itermap.helpdesk@gmail.com")} title="Contact" color="#ad0a4c" />
					</View>
				</View>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		alignItems: "flex-start",
		justifyContent: "center",
		padding: d.width * 0.025,
		paddingTop: d.width * 0.025,
	},
});

import React from "react";
import { AsyncStorage, Button, Dimensions, StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as config from "../Config.json";

interface State {
	title: string;

	goback?: boolean;
}

export class CreateNewRoute extends React.Component<IProps, State> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			title: "",
		};

		this.next = this.next.bind(this);
	}

	next() {
		AsyncStorage.getItem("token", (err, token) => {
			if (token) {
				fetch(`${config.host}/api/newRoute`, {
					method: "POST",
					headers: {
						Accept: "application/json",
						Cookie: `session=${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: this.state.title,
					}),
				})
					.then((res) => res.json())
					.then((res) => {
						this.props.navigation.goBack();
						this.props.navigation.navigate("EditRoute", { id: res.id });
					});
			}
		});
	}

	render() {
		return (
			<View>
				<View style={{ flexDirection: "row", width: "100%", height: 54, backgroundColor: "#242424", elevation: 5, paddingHorizontal: "2.5%", justifyContent: "flex-start", alignItems: "center" }}>
					<TouchableOpacity
						onPress={() => {
							this.props.navigation.goBack();
						}}
					>
						<Icon name="arrow-left" color="white" size={28} />
					</TouchableOpacity>
					<Text style={{ fontSize: 18, color: "white", marginLeft: "2.5%" }}>Create new route</Text>
				</View>
				<View style={styles.container}>
					<TextInput onChangeText={(title) => this.setState({ title })} placeholder="Route title" style={styles.textInput}></TextInput>
					<Button title="Create route" onPress={this.next} color="#ad0a4c" />
				</View>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "space-evenly",
		padding: d.width * 0.05,
		height: d.height * 0.3,
	},
	textInput: {
		width: "100%",
	},
	picker: {
		height: 50,
		width: 50,
	},
});

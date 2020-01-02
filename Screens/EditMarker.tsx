import React, { Component } from "react";
import { View, TextInput, Button, StyleSheet, Text, Picker } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BetterImage } from "../Components/BetterImage";

import ImagePicker, { Image } from "react-native-image-crop-picker";
import RNFetchBlob from "rn-fetch-blob";

import * as config from "../Config.json";
import { TouchableOpacity } from "react-native-gesture-handler";
import { NavigationStackOptions } from "react-navigation-stack";

interface Props extends IProps {}

interface State extends IMarker {
	routeId: string;

	mainPicSource: string;
	mainPicStartLocation: { x: number; y: number };
	mainPicRadius: number;
	pictureSources: Array<string>;
}

export class EditMarker extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		let data: IMarker = this.props.navigation.getParam("data", {});
		console.log("DID MOUNT");
		!this.props.navigation.getParam("update", false) && this.setState({ ...data });
	}

	componentDidUpdate() {
		console.log("DID UPDATE");
		JSON.stringify(this.props.navigation.getParam("data", {})) != JSON.stringify(this.state) && this.props.navigation.setParams({ data: { ...this.state }, update: true });
	}

	render() {
		let mainPic = this.state?.pictures?.[0] ?? this.state?.mainPicSource;

		return (
			<View style={{ flexDirection: "column", justifyContent: "space-evenly", padding: "5%", width: "100%", height: "100%" }}>
				<TextInput style={styles.textInput} value={this.state?.title} onChangeText={(title) => this.setState({ title })}></TextInput>

				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					<Text style={{ width: "33%" }}>Time spent here:</Text>
					<TextInput style={{ ...styles.textInput, width: "13%", marginTop: 0, marginHorizontal: "5%" }} value={this.state?.price?.value?.toString()} placeholder="Price" onChangeText={(cost) => this.setState({ price: { value: parseInt(cost), currency: "€" } })}></TextInput>
					<Picker mode="dropdown" onValueChange={() => {}} selectedValue={"m"} style={{ width: "43%" }}>
						<Picker.Item label="Minutes" value="m"></Picker.Item>
						<Picker.Item label="Hours" value="h"></Picker.Item>
					</Picker>
				</View>
				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					<Text style={{ width: "33%" }}>Cost:</Text>
					<TextInput style={{ ...styles.textInput, width: "13%", marginTop: 0, marginHorizontal: "5%" }} value={this.state?.price?.value?.toString()} placeholder="Price" onChangeText={(cost) => this.setState({ price: { value: parseInt(cost), currency: "€" } })}></TextInput>
					<Picker mode="dropdown" onValueChange={() => {}} selectedValue={"Local"} style={{ width: "43%" }}>
						<Picker.Item label="€" value="€"></Picker.Item>
						<Picker.Item label="$" value="$"></Picker.Item>
						<Picker.Item label="£" value="£"></Picker.Item>
						<Picker.Item label="Local currency" value="Local"></Picker.Item>
					</Picker>
				</View>

				<View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
					<Text>Day: </Text>
					<TextInput
						style={{ ...styles.textInput, width: "5%", marginTop: 0 }}
						value={this.state?.price?.value?.toString()}
						placeholder="Price"
						onChangeText={(cost) => {
							this.setState({ price: { value: parseInt(cost), currency: "€" } });
						}}
					></TextInput>
				</View>

				<View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
					{mainPic ? (
						<BetterImage url={`${config.host}/routeImages?route=${this.state.routeId}&image=${mainPic}`} imageSource="web" cacheImage={false} imageStyle={{ width: "100%", height: "100%", borderRadius: 32 }} parentViewStyle={{ width: 64, height: 64, marginTop: 10, marginLeft: 20 }} data={this.props.data} navigation={this.props.navigation}></BetterImage>
					) : (
						<TouchableOpacity
							onPress={() => {
								ImagePicker.openPicker({
									multiple: false,
									mediaType: "photo",
									includeBase64: false,
								})
									.then((res: Image[]) => {
										console.log(res);

										this.setState({ mainPicSource: res[0].path });

										// console.log(res)
										// this.setState({ mainPicSource: res[0]. }); // TODO image check, mini width etc..

										// fetch(`${config.host}/uploadMarkerPicture`, {
										// 	method: "POST",
										// 	headers: {
										// 		Accept: "application/json",
										// 		"Content-Type": "application/json",
										// 		Cookie: `session=${this.props.data.token}`,
										// 	},
										// 	body: JSON.stringify({
										// 		image: res.data,
										// 		routeId: this.state.routeId,
										// 	}),
										// })
										// 	.then((res) => res.json())
										// 	.then((res) => {
										// 		console.log(res);

										// 		this.setState({ pictures: [res.id, ...this.state.pictures.slice(1)] });
										// 	})
										// 	.catch((err) => {
										// 		console.log(err);
										// 	});
									})
									.catch((error) => {
										console.log(error);
									});
							}}
							style={styles.addMainImage}
						>
							<View style={{ alignItems: "center" }}>
								<Icon style={{}} name="image-plus" size={48} />
								<Text style={{ color: "#242424" }}>Select marker picture</Text>
							</View>
						</TouchableOpacity>
					)}

					<TouchableOpacity
						onPress={() => {
							ImagePicker.openPicker({
								multiple: false,
								mediaType: "photo",
								includeBase64: false,
							})
								.then((res: Image[]) => {
									console.log(res);

									this.setState({ mainPicSource: res[0].path });

									// console.log(res)
									// this.setState({ mainPicSource: res[0]. }); // TODO image check, mini width etc..

									// fetch(`${config.host}/uploadMarkerPicture`, {
									// 	method: "POST",
									// 	headers: {
									// 		Accept: "application/json",
									// 		"Content-Type": "application/json",
									// 		Cookie: `session=${this.props.data.token}`,
									// 	},
									// 	body: JSON.stringify({
									// 		image: res.data,
									// 		routeId: this.state.routeId,
									// 	}),
									// })
									// 	.then((res) => res.json())
									// 	.then((res) => {
									// 		console.log(res);

									// 		this.setState({ pictures: [res.id, ...this.state.pictures.slice(1)] });
									// 	})
									// 	.catch((err) => {
									// 		console.log(err);
									// 	});
								})
								.catch((error) => {
									console.log(error);
								});
						}}
						style={styles.addMainImage}
					>
						<View style={{ alignItems: "center" }}>
							<Icon style={{}} name="image-multiple" size={48} />
							<Text style={{ color: "#242424" }}>Add other images</Text>
						</View>
					</TouchableOpacity>
				</View>

				<TextInput style={{ ...styles.textInput, height: 100, marginTop: 0 }} multiline value={this.state?.description} placeholder="Description..." onChangeText={(description) => this.setState({ description })}></TextInput>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	textInput: {
		borderBottomColor: "#ad0a4c",
		borderBottomWidth: 2,
		marginTop: 10,
	},
	addMainImage: {
		height: 128,
		width: 128,
		justifyContent: "center",
		flexDirection: "column",
	},
});

import React, { Component } from "react";
import { Dimensions, Picker, StyleSheet, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CachableImage } from "../Components/CachableImage";
import * as config from "../Config.json";

interface Props extends IProps {}

interface State extends IMarker {
	routeId: string;
}

export class EditMarker extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		let data: IMarker = this.props.navigation.getParam("data", {});
		// console.log("DID MOUNT");
		!this.props.navigation.getParam("update", false) && this.setState({ ...data });
	}

	componentDidUpdate() {
		// console.log("DID UPDATE");
		JSON.stringify(this.props.navigation.getParam("data", {})) != JSON.stringify(this.state) && this.props.navigation.setParams({ data: { ...this.state }, update: true });
	}

	render() {
		// let mainPic = this.state?.pictures?.[0] ?? this.state?.mainPicSource;

		return (
			<View style={{ flexDirection: "column", justifyContent: "flex-start", padding: "5%", paddingTop: "2.5%", width: "100%", height: "100%" }}>
				<TextInput style={styles.textInput} value={this.state?.title} onChangeText={(title) => this.setState({ title })}></TextInput>

				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					<Text style={{ width: "33%" }}>Time spent here:</Text>

					<TextInput
						keyboardType="numeric"
						style={{ ...styles.textInput, width: "13%", marginTop: 0, marginHorizontal: "5%" }}
						value={this.state?.time?.time?.toString()}
						onChangeText={(time) => {
							//@ts-ignore
							this.setState({ time: { time: time.length > 0 ? (isNaN(parseInt(time)) ? this.state.time.time : parseInt(time)) : "", unit: this.state.time.unit } });
						}}
					></TextInput>
					<Picker
						mode="dropdown"
						onValueChange={(unit) => {
							this.setState({ time: { time: this.state.time?.time ?? 0, unit } });
						}}
						selectedValue={this.state?.time?.unit ?? "m"}
						style={{ width: "43%" }}
					>
						<Picker.Item label="Minutes" value="m"></Picker.Item>
						<Picker.Item label="Hours" value="h"></Picker.Item>
					</Picker>
				</View>
				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					<Text style={{ width: "33%" }}>Cost:</Text>

					<TextInput
						keyboardType="numeric"
						style={{ ...styles.textInput, width: "13%", marginTop: 0, marginHorizontal: "5%" }}
						value={this.state?.price?.value?.toString()}
						onChangeText={(cost) => {
							//@ts-ignore
							this.setState({ price: { value: cost.length > 0 ? (isNaN(parseInt(cost)) ? this.state.price.value : parseInt(cost)) : "", currency: this.state?.price?.currency ?? "Local" } });
						}}
					></TextInput>
					<Picker
						mode="dropdown"
						onValueChange={(currency) => {
							this.setState({ price: { value: this.state.price.value, currency } });
						}}
						selectedValue={this.state?.price?.currency ?? "Local"}
						style={{ width: "43%" }}
					>
						<Picker.Item label="€" value="€"></Picker.Item>
						<Picker.Item label="$" value="$"></Picker.Item>
						<Picker.Item label="£" value="£"></Picker.Item>
						<Picker.Item label="Local currency" value="Local"></Picker.Item>
					</Picker>
				</View>

				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", marginTop: "10%"}}>
					{this.state?.routeId && <CachableImage
						source={{ uri: `${config.host}/api/routeImages?route=${this.state.routeId}&image=${this.state.pictures[0]}&form=cover`, headers: {} }}
						imageProps={{
							source: null,
							style: { width: d.width * 0.25, height: d.width * 0.25 , borderRadius: 8 },
						}}
						data={this.props.data}
					></CachableImage>}

					<TouchableOpacity
						onPress={() => {
							this.props.navigation.navigate("Gallery", {
								callback: (pictures) => {
									console.log(pictures);
									this.setState({ pictures: pictures.images });
								},
								data: {
									images: [...this.state.pictures],
									routeId: this.state.routeId,
									markerId: this.state.id,
								},
							});
						}}
					>
						<Icon style={{}} name="image-multiple" size={48} />
						<Text>View Gallery </Text>
					</TouchableOpacity>
				</View>
				{/*<View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
					{mainPic ? (
						<BetterImage url={this.state.mainPicSource ? this.state.mainPicSource : `${config.host}/api/routeImages?route=${this.state.routeId}&image=${mainPic}`} imageSource="web" cacheImage={false} imageStyle={{ width: "100%", height: "100%", borderRadius: 32 }} parentViewStyle={{ width: 64, height: 64, marginTop: 10, marginLeft: 20 }} data={this.props.data} navigation={this.props.navigation}></BetterImage>
					) : (
						<TouchableOpacity
							onPress={() => {
								ImagePicker.openPicker({
									multiple: false,
									mediaType: "photo",
									includeBase64: true,
								})
									.then((res: Image) => {
										console.log(res);

										this.setState({ mainPicSource: res.path });

										// console.log(res)
										// this.setState({ mainPicSource: res[0]. }); // TODO image check, mini width etc..

										fetch(`${config.host}/api/uploadMarkerPicture`, {
											method: "POST",
											headers: {
												Accept: "application/json",
												"Content-Type": "application/json",
												Cookie: `session=${this.props.data.token}`,
											},
											body: JSON.stringify({
												image: res.data,
												routeId: this.state.routeId,
											}),
										})
											.then((res) => res.json())
											.then((res) => {
												console.log(res);

												this.setState({ pictures: [res.id, ...this.state.pictures.slice(1)] });
											})
											.catch((err) => {
												console.log(err);
											});
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

									// fetch(`${config.host}/api/uploadMarkerPicture`, {
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
					</View>*/}

				<TextInput style={{ ...styles.textInput, height: 100, marginTop: 0 }} multiline value={this.state?.description} placeholder="Description..." onChangeText={(description) => this.setState({ description })}></TextInput>
			</View>
		);
	}
}

const d = Dimensions.get("screen");

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

import React, { Component } from "react";
import { Dimensions, ImageBackground, Platform, StyleSheet, Text, View } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import ImagePicker, { Image } from "react-native-image-crop-picker";
import ProgressBar from "react-native-progress/Bar";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNFetchBlob from "rn-fetch-blob";
import * as config from "../Config.json";

interface Props extends IProps {}

interface State {
	routeId: string;

	markerId: string;

	images: Array<string>;

	selectingPictures: boolean;
	selectedPictures: Array<string>;

	uploading: boolean;
	uploadProgress: number;
}

export class Gallery extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
	}

	componentDidMount() {
		console.log("GALLERY DID MOUNT");
		let data = this.props.navigation.getParam("data", false);
		data && this.setState({ ...data });
	}

	componentDidUpdate() {
		console.log("GALLERY DID UPDATE");
		JSON.stringify(this.props.navigation.getParam("data", {})) != JSON.stringify(this.state) && this.props.navigation.setParams({ data: { ...this.state }, update: true });
	}

	render() {
		console.table(this.state);
		if (!this.state?.images) return null;

		return (
			<View style={{ flexDirection: "column", justifyContent: "space-evenly", width: "100%", height: "100%" }}>
				<ScrollView style={{ flexDirection: "row", flexWrap: "wrap", backgroundColor: "white", width: "100%", height: "100%" }} contentContainerStyle={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap" }}>
					{this.state.uploading && (
						<View style={{ backgroundColor: "white", width: "100%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", height: d.height * 0.05 }}>
							<ProgressBar progress={this.state.uploadProgress} width={d.width * 0.7} height={20} color="#ad0a4c" borderRadius={10} useNativeDriver={true}></ProgressBar>

							<Text style={{ color: "#242424" }}>{Math.round(this.state.uploadProgress * 100)}%</Text>
						</View>
					)}
					{(() => {
						console.log(this.state.images);
						let iKey = 0;
						let images = this.state.images
							.map((photo, ci) => (
								<TouchableOpacity
									key={`${photo}`}
									delayLongPress={250}
									onLongPress={() => {
										console.log("LONG PRESS!");
										this.setState({ selectingPictures: true, selectedPictures: [...(this.state.selectedPictures ?? []), `${photo}`] });
									}}
									activeOpacity={1}
									onPress={() => {
										if (!this.state.selectingPictures) return;

										let i = this.state.selectedPictures.indexOf(`${photo}`);
										if (i > -1) {
											let selectedPictures = [...this.state.selectedPictures.slice(0, i), ...this.state.selectedPictures.slice(i + 1)];
											this.setState({ selectedPictures, selectingPictures: selectedPictures.length > 0 });
										} else this.setState({ selectedPictures: [...this.state.selectedPictures, `${photo}`] });
									}}
								>
									{(() => {
										console.table(photo);
										console.log(this.state);
										console.log(`${config.host}/api/routeImages?route=${this.state.routeId}&image=${photo}&form=cover`);
										return null;
									})()}
									<ImageBackground key={`${photo}_bckg`} source={{ uri: `${config.host}/api/routeImages?route=${this.state.routeId}&image=${photo}&form=cover` }} style={{ width: d.width * 0.245, height: d.width * 0.245, margin: d.width * 0.002, backgroundColor: "#242424" }}>
										<View style={{ backgroundColor: this.state.selectedPictures?.indexOf(`${photo}`) > -1 ? "#ad0a4c55" : "#00000000", flex: 1 }}></View>
										{/*	<View style={{ alignItems: "flex-start", justifyContent: this.state.selectingPictures && (id == "unknown" || id.split("_")[0] == "unknown" || !types || types?.length == 0) ? "space-between" : "flex-end", paddingBottom: d.width * 0.002, marginTop: ci < 5 ? 0 : d.width * 0.002, width: "100%", height: "100%", backgroundColor: this.state.selectedPictures.indexOf(`${id}/${photo}`) > -1 ? "#ad0a4c55" : "#00000000" }}>
                                            {(id == "unknown" || id.split("_")[0] == "unknown" || !types || types?.length == 0) && <Icon name="map-marker-plus" size={16} color="#ad0a4c" />}
                                            {this.state.selectedPictures.indexOf(`${id}/${photo}`) > -1 ? <Icon name="checkbox-marked" size={20} color="#ad0a4c" style={{ alignSelf: "flex-end" }} /> : this.state.selectingPictures ? <Icon name="checkbox-blank-outline" size={20} color="#ad0a4c" style={{ alignSelf: "flex-end" }} /> : null}
                                </View>*/}
									</ImageBackground>
								</TouchableOpacity>
							))
							.reduce((pv, cv, ci, arr) => (pv.length < arr.length ? arr.slice().concat(Array(4 - (arr.length % 4)).fill(<View key={`fill_${++iKey}`} style={{ width: d.width * 0.25, height: d.width * 0.25 }}></View>)) : pv), []);
						return images;
					})()}
					<View style={{ height: d.height * 0.3, width: d.width }}></View>
				</ScrollView>

				{this.state.selectingPictures ? (
					<View style={{ width: d.width, backgroundColor: "white", flexDirection: "row", justifyContent: "space-evenly", height: 85, position: "absolute", top: d.height - 160, alignItems: "flex-start" }}>
						{this.state.selectedPictures.length == 1 && (
							<TouchableOpacity
								style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
								onPress={() => {
									this.setState({ images: [this.state.selectedPictures[0], ...this.state.images.filter((p) => p != this.state.selectedPictures[0])] });
								}}
							>
								<Icon name="map-marker" size={28} color="#242424" />
								<Text style={{ alignContent: "center", textAlign: "center" }}>Set marker{"\n"}picture</Text>
							</TouchableOpacity>
						)}

						{/*<TouchableOpacity
							style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
							onPress={async () => {

								// TODO enable sharing
								
								// this.state.selectedPictures.map((pic) => console.log);
								// console.log(this.state.selectedPictures.map((pic) => `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`));
								// let files = await Promise.all(this.state.selectedPictures.map((pic) => RNFetchBlob.fs.readFile(`file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`, "base64")));
								// console.log(files);
								// Share.open({ urls: files.map((file: string) => `data:image/png;base64,${file}`) })
								//     .then((res) => {
								//         console.log(res);
								//     })
								//     .catch((err) => {
								//         err && console.log(err);
								//     });
							}}
						>
							<Icon name="share-variant" size={28} color="#242424" />
							<Text>Share</Text>
						</TouchableOpacity>*/}

						<TouchableOpacity
							style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
							onPress={() => {
								let images = this.state.images.slice();

								console.log(images);
								this.state.selectedPictures.forEach((p) => {
									images = images.filter((v) => v != p);
								});

								console.log(images);

								fetch(`${config.host}/api/removeMarkerPictures`, {
									method: "POST",
									headers: {
										Accept: "application/json",
										Cookie: `session=${this.props.data.token}`,
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										routeId: this.state.routeId,
										markerId: this.state.markerId,
										pictures: this.state.selectedPictures,
									}),
								}).catch((err) => {
									err && console.log(err);
								});

								this.setState({ images, selectedPictures: [], selectingPictures: false });
								// let files = this.state.selectedPictures.map((pic) => `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`);
								// CameraRoll.deletePhotos(files);
								// files.map((file) => RNFetchBlob.fs.unlink(file));
								// let newMarkers = [];
								// this.state.markers.forEach((marker) => {
								//     this.state.selectedPictures.forEach((pic) => {
								//         let i = marker.pictures.indexOf(pic.split("/")[1]);
								//         if (i > -1) marker.pictures = [...marker.pictures.slice(0, i), ...marker.pictures.slice(i + 1)];
								//     });
								//     if (marker.pictures.length > 0) newMarkers.push(marker);
								// });
								// this.props.data.liveRoutesTracking.forEach(({ id, tracking }) => {
								//     if (tracking) {
								//         AsyncStorage.getItem(`live_${id}`, (err, res) => {
								//             let liveRoute: ILiveRoute = JSON.parse(res);
								//             liveRoute.markers = newMarkers;
								//             AsyncStorage.setItem(`live_${id}`, JSON.stringify(liveRoute), (error) => {
								//                 error && console.log(error);
								//             });
								//         });
								//     }
								// });
								// this.setState({ markers: newMarkers });
							}}
						>
							<Icon name="delete" size={28} color="#242424" />
							<Text>Delete</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
							onPress={() => {
								this.setState({ selectedPictures: [], selectingPictures: false });
							}}
						>
							<Icon name="close" size={28} color="#242424" />
							<Text>Cancle</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={{ alignSelf: "flex-end", borderRadius: 30, backgroundColor: "white", elevation: 5, width: 60, height: 60, marginBottom: d.width * 0.05, marginRight: d.width * 0.05, alignItems: "center", flexDirection: "row", justifyContent: "center", zIndex: 20 }}>
						<TouchableOpacity
							onPress={() => {
								ImagePicker.openPicker({
									multiple: true,
									mediaType: "photo",
									includeBase64: false,
									includeExif: true,									
									compressImageQuality: 0.8,
									compressImageMaxWidth: 2048,
									compressImageMaxHeight: 1080,
									writeTempFile: true,
								}).then((res: Image[]) => {
									//@ts-ignore
									console.log(res.map((r) => r.exif));

									console.log(res.map((r) => ({ width: r.width, height: r.height })));

									let toUp = res.reduce((pv, image) => {
										if (Platform.OS == "android") {
											// @ts-ignore
											return pv.concat({ name: "nextOrientation", data: image.exif.Orientation }, { name: "any_name", filename: "any_filename.jpg", type: image.mime, data: `RNFetchBlob-${image.path}` });
										} else {
											return pv.concat({ name: "any_name", filename: "any_filename.jpg", type: image.mime, data: `RNFetchBlob-${image.path}` });
										}
									}, []);

									//@ts-ignore
									toUp.unshift({ name: "routeId", data: this.state.routeId });
									toUp.unshift({ name: "markerId", data: this.state.markerId });

									console.table(toUp);

									this.setState({ uploadProgress: 0, uploading: true });
									RNFetchBlob.fetch(
										"POST",
										`${config.host}/api/uploadMarkerPictures`,
										{
											Cookie: `session=${this.props.data.token}`,
											"Content-Type": "multipart/form-data",
										},
										toUp,
									)
										.uploadProgress({ interval: 100 }, (sent, total) => {
											console.log(`${Math.round((sent / total) * 100)}%`);

											this.setState({ uploadProgress: sent / total });
										})
										.then((res) => {
											console.log(res);

											let data = res.json();
											data.length > 0 && this.setState({ images: [...data, ...this.state.images] });

											this.setState({ uploading: false });
										})
										.catch((err) => {
											this.setState({ uploading: false });
											err && console.log(err);
										});
								});
							}}
						>
							<Icon name="plus" color="#ad0a4c" size={42} />
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	}
}

function handlePhotoOrientation(photo) {
	let photoOrientationData = photo.exif.Orientation;
	let width, height;
	if (photoOrientationData) {
		switch (parseInt(photoOrientationData)) {
			case 1: // ORIENTATION_NORMAL (values should be swapped)
				return {
					width: height,
					height: width,
				};
			case 3: // ORIENTATION_ROTATE_180 (values should be swapped)
				return {
					width: height,
					height: width,
				};
			default:
				return {
					width: photo.width,
					height: photo.height,
				};
		}
	} else {
		return {
			width: photo.width,
			height: photo.height,
		};
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

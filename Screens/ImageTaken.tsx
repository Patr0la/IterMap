import React from "react";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import * as config from "../Config.json";
import { View, ImageBackground, Text, StyleSheet, Switch, Dimensions, StatusBar, Image, KeyboardAvoidingView } from "react-native";
import { TouchableOpacity, TextInput } from "react-native-gesture-handler";

import Carousel from "react-native-snap-carousel";

import { TypeToIcon } from "../Components/Search";
import RNFetchBlob from "rn-fetch-blob";

interface Props extends IProps {}

interface State {
    imageData?: string;
    timeTaken?: number;
    flash?: boolean;
    front?: boolean;
    location?: IPos;

    uploadNow?: boolean;

    places: Array<IPlaceNerby>;

    currentPage: number;

    selectingPlace: boolean;
    selectedPlace?: string;

    keyboardOpen: boolean;
}

export class ImageTaken extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            selectingPlace: false,
            places: [],

            currentPage: 0,
            keyboardOpen: false
        };
    }

    render() {
        const imageData = this.props.navigation.getParam("imageData", "none");
        const location = this.props.navigation.getParam("location", "none");
        if (imageData != this.state.imageData) {
            // TODO rest of props
            this.setState({ imageData, location });
            console.log("REEEEE1111");
            fetch(`http://${config.host}/findPlacesNear`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Cookie: `session=${this.props.data.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lat: location.lat,
                    lng: location.lng,
                }),
            })
                .then(res => res.json())
                .then(places => {
                    places.push({ id: "custom" });
                    this.setState({ places });
                });
        }

        if (this.state.imageData)
            return (
                <ImageBackground
                    source={{ uri: `data:image/png;base64,${this.state.imageData}` }}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                >
                    {!this.state.selectingPlace && (
                        <View
                            style={{
                                flexDirection: "column",
                                justifyContent: "space-between",
                                ...StyleSheet.absoluteFillObject,
                            }}
                        >
                            <View style={styles.row}>
                                <Icon name="close" size={33} color="white" onPress={() => this.props.navigation.goBack()} />
                                {this.state.uploadNow ? <Icon name="cloud-upload" size={42} color="white" onPress={() => this.setState({ uploadNow: !this.state.uploadNow })} /> : <Icon name="cloud-off-outline" size={42} color="white" onPress={() => this.setState({ uploadNow: !this.state.uploadNow })} />}
                            </View>
                            <View style={styles.row}>
                                <TouchableOpacity onPress={() => this.setState({ selectingPlace: true })}>
                                    <Icon name="map-marker" size={42} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        RNFetchBlob.fs.exists(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter`).then(exists => {
                                            if (exists)
                                                RNFetchBlob.fs.writeFile(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${new Date().getTime()}.png`, imageData, "base64").then(value => {
                                                    console.log(value);
                                                });
                                            else
                                                RNFetchBlob.fs.mkdir(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter`).then(() => {
                                                    RNFetchBlob.fs.writeFile(`${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${new Date().getTime()}.png`, imageData, "base64").then(value => {
                                                        console.log(value);
                                                    });
                                                });
                                        });
                                    }}
                                >
                                    <Icon name="download" size={42} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <KeyboardAvoidingView style={{ width: d.width, height: d.height, flexDirection: this.state.keyboardOpen ? "column-reverse" : "column", justifyContent: "flex-end", display: this.state.selectingPlace ? "flex" : "none" }}>
                        {/*<View style={{height: d.height * 0.8, backgroundColor: "red"}}></View>*/}
                        <TouchableOpacity style={{ height: "100%" }} onPress={() => this.setState({ selectingPlace: false })}></TouchableOpacity>
                        <View style={{ marginBottom: "5%" }}>
                            <Carousel
                                data={this.state.places}
                                renderItem={({ item: { id, name, photo, types, distance } }) => {
                                    if (id == "custom")
                                        return (
                                            <View key={id} style={{ width: d.width * 0.8, height: d.height * 0.3, flexDirection: "row", alignItems: "center" }}>
                                                <View style={{ backgroundColor: "white", width: "100%", height: d.height * 0.15, flexDirection: "column", flex: 1, marginRight: "5%", elevation: 5, justifyContent: "space-around", padding: "4%" }}>
                                                <TextInput onFocus={() => this.setState({keyboardOpen: true})} onGestureEvent={(e) => this.setState({keyboardOpen: false})} onEndEditing={(e) => this.setState({keyboardOpen: false})} onBlur={() => this.setState({keyboardOpen: false})} placeholder="Costum place"></TextInput>
                                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                                                        <Icon name="chevron-down" size={32} color="#242424" />
                                                    </View>
                                                </View>
                                                <View style={{ position: "absolute", right: 0, bottom: d.height * 0.05, width: d.width * 0.1, height: d.width * 0.1, backgroundColor: "#242424", elevation: 6, alignItems: "center", flexDirection: "row", justifyContent: "center", borderRadius: 5 }}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            this.setState({ selectedPlace: id, selectingPlace: false });
                                                        }}
                                                    >
                                                        <Icon name="map-marker-check" color="white" size={42} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        );

                                    return (
                                        <View key={id} style={{ width: d.width * 0.8, height: d.height * 0.3, flexDirection: "row", alignItems: "center" }}>
                                            {photo && <Image source={{ uri: `https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyDmYhpLaw_znrqhOtnqkQ4CcWFwL6xqjCM&photoreference=${photo}&maxheight=${1600}` }} style={{ width: Math.round(d.width * 0.4), height: "100%" }} onError={err => console.log(err.nativeEvent.error)}></Image>}
                                            <View style={{ backgroundColor: "white", width: "100%", height: d.height * 0.15, flexDirection: "column", flex: 1, marginRight: "5%", elevation: 5, justifyContent: "space-around", padding: "4%" }}>
                                                <Text style={{ color: "#242424", fontSize: 22, flex: 1, flexWrap: "wrap" }}>{name}</Text>

                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                                                    <Icon name={TypeToIcon[types[0]]} size={32} color="#242424" />
                                                    <Icon name="map-marker-distance" color="#242424" size={22} />
                                                    <Text>{Math.round(distance)} m</Text>
                                                </View>
                                            </View>
                                            <View style={{ position: "absolute", right: 0, bottom: d.height * 0.05, width: d.width * 0.1, height: d.width * 0.1, backgroundColor: "#242424", elevation: 6, alignItems: "center", flexDirection: "row", justifyContent: "center", borderRadius: 5 }}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        this.setState({ selectedPlace: id, selectingPlace: false });
                                                    }}
                                                >
                                                    <Icon name="map-marker-check" color="white" size={42} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                }}
                                itemWidth={d.width * 0.8}
                                sliderWidth={d.width}
                                horizontal
                            />
                        </View>
                    </KeyboardAvoidingView>
                </ImageBackground>
            );
        return <View></View>;
    }
}

interface IPlaceNerby {
    name: string;
    id: string;
    types: Array<string>;
    photo: string;
    distance: number;
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: "2.5%",
        marginLeft: "2.5%",
        marginRight: "2.5%",
        paddingTop: StatusBar.currentHeight,
        alignItems: "center",
    },
});

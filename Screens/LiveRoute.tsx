import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, PermissionsAndroid, Dimensions, TouchableOpacity, TextInput, ImageBackground } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Search } from "../Components/Search";
import { RoutesPreview } from "../Components/RoutesPreview";

import { PageNavigator } from "../Components/PageNavigator";
import MapView, { PROVIDER_GOOGLE, Polyline, Marker, Circle } from "react-native-maps";
import { MapStyle } from "../MapStyle";
import AsyncStorage from "@react-native-community/async-storage";
import { ScrollView } from "react-native-gesture-handler";

import ViewPager from "@react-native-community/viewpager";

import * as config from "../Config.json";
import RNFetchBlob from "rn-fetch-blob";
import { BetterImage } from "../Components/BetterImage";

import Share from "react-native-share"
import CameraRoll from "@react-native-community/cameraroll";

interface Props extends IProps {
    navigatedTo?: boolean;
    id?: string;
    ids?: Array<string>;
    pageMove?: () => void;
}

interface State extends ILiveRoute {
    viewing: "back" | "route" | "stats" | "gallery";
    id?: string;


    selectingPictures: boolean;
    selectedPictures: Array<string>;
}

export class LiveRoute extends React.Component<Props, State> {
    static navigationOptions = {
        drawerLabel: "Home",
        //drawerIcon: ({ tintColor }) => <Image style={[styles.icon, { tintColor: tintColor }]} />,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            viewing: "route",

            selectingPictures: false,
            selectedPictures: [],
        };
    }

    calculateRoutePoints(route: ILiveRoute) {
        let average = route.path.reduce((total, { accuracy }) => total + accuracy, 0) / route.path.length;

        let path = route.path.filter(({ accuracy }) => accuracy < average);
        return path;
    }

    MapView: MapView;
    lastUpdateTime: number = 0;
    pageNavigator: PageNavigator;
    render() {
        if (this.props.navigatedTo) {
            let id: string = this.props.navigation.getParam("id", undefined);
            let cTime = (new Date()).getTime();
            if ((id && id != this.state.localId) || cTime - 5000 > this.lastUpdateTime) {
                AsyncStorage.getItem(`live_${id}`, (err, res) => {
                    if (err) console.error(err);

                    let route: ILiveRoute = JSON.parse(res);
                    route.path = this.calculateRoutePoints(route);
                    this.setState({ ...route })

                    this.lastUpdateTime = cTime;
                });
            }
        }
        else {
            AsyncStorage.getItem(`live_${this.props.id}`, (err, res) => {
                if (err) console.error(err);

                let route: ILiveRoute = JSON.parse(res);
                route.path = this.calculateRoutePoints(route);
                this.setState({ ...route })
            });
        }

        return (
            <View>
                <View></View>
                <PageNavigator
                    ref={ref => this.pageNavigator = ref}
                    default="route"
                    routes={[
                        {
                            title: <Icon name="arrow-left" size={26} color="white" style={{ alignSelf: "center" }} />,
                            value: "back",
                        },
                        {
                            title: "Route",
                            value: "route",
                        },
                        {
                            title: "Stats",
                            value: "stats",
                        },
                        {
                            title: "Gallery",
                            value: "gallery",
                        },
                    ]}
                    onSelectionChange={viewing => {
                        if (viewing == "back") {
                            this.pageNavigator.setState({ viewing: this.state.viewing })
                            this.props.pageMove();
                        }
                        else
                            this.setState({ viewing })
                    }

                    }
                />

                {this.state.viewing == "route" ? (
                    <View style={{ width: "100%", height: "100%" }}>
                        <MapView
                            cacheEnabled
                            onPoiClick={e => alert(e.nativeEvent.name)}
                            ref={ref => (this.MapView = ref)}
                            //onLayout={() => this.props.onMapLayout()}
                            style={{ width: "100%", height: "100%" }}
                            customMapStyle={MapStyle}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: this.props.data.lastPos?.latitude || 0,
                                longitude: this.props.data.lastPos?.longitude || 0,
                                latitudeDelta: 0.04,
                                longitudeDelta: 0.02,
                            }}
                            onPress={e => {
                                console.log(e);
                            }}
                            onMarkerPress={e => {
                                console.log(e);
                            }}
                            onLayout={e => this.state.path?.length && this.MapView.fitToCoordinates(this.state.path, { animated: false, edgePadding: { bottom: 50, left: 50, right: 50, top: 50 } })}
                        >
                            {this.state.path?.length > 1 && <Polyline coordinates={this.state.path} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}

                            {this.state.markers?.map((m, i) => m.pos && <Marker coordinate={m.pos} key={i}>
                                <View style={{ width: 56, height: 56 }}>
                                    <Icon name="map-marker" size={56} style={{ position: "absolute", /*marginTop: 5*/ }} color="#242424" />
                                    {m.pictures && m.pictures[0] &&
                                        <Image
                                            source={{ uri: `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${m.pictures[0]}` }}
                                            style={{ width: 32, height: 32, marginLeft: 12, marginTop: 6, borderRadius: 22 }}
                                        >
                                        </Image>}
                                </View>
                            </Marker>)}

                            {this.props.data.lastPos && <Circle center={this.props.data.lastPos} radius={20} strokeColor="#ad0a4c" strokeWidth={2} fillColor="#ad0a4c" zIndex={99999999999}></Circle>}
                        </MapView>

                        <TouchableOpacity style={{ position: "absolute", left: d.width - d.width * 0.2, top: d.height - d.width * 0.2 * d.height / d.width, width: 58, height: 58, borderRadius: 50, backgroundColor: "white", elevation: 5, justifyContent: "center", alignItems: "center" }} onPress={() => {
                            this.MapView.setCamera({ center: this.props.data.lastPos, zoom: 16 })
                        }}>

                            <Icon name="crosshairs-gps" size={32} color="#ad0a4c" />
                        </TouchableOpacity>
                    </View>
                ) : this.state.viewing == "stats" ? (
                    <View style={{ backgroundColor: "white", width: "100%", height: "100%" }}>
                        <Text>
                            {JSON.stringify(this.state)}
                        </Text>
                    </View>
                ) : (
                            <ScrollView style={{ flexDirection: "row", flexWrap: "wrap", backgroundColor: "white" }} contentContainerStyle={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap" }}>
                                {(() => {
                                    let images = this.state.markers.reduce((pv, marker, markeri) => [...marker.pictures.map(p => ({ id: marker.id, photo: p, types: marker.types })), ...pv], [])
                                        .sort((a, b) => a.photo < b.photo ? 1 : a.photo > b.photo ? -1 : 0)
                                        .map(({ id, photo, types }, ci) =>
                                            <TouchableOpacity key={`${id}/${photo}`}
                                                delayLongPress={250}
                                                onLongPress={() => {
                                                    console.log("LONG PRESS!")
                                                    this.setState({ selectingPictures: true, selectedPictures: [...this.state.selectedPictures, `${id}/${photo}`] })
                                                }}
                                                activeOpacity={1}
                                                onPress={() => {
                                                    if (!this.state.selectingPictures) return;

                                                    let i = this.state.selectedPictures.indexOf(`${id}/${photo}`);
                                                    if (i > -1) {
                                                        let selectedPictures = [...this.state.selectedPictures.slice(0, i), ...this.state.selectedPictures.slice(i + 1)]
                                                        this.setState({ selectedPictures, selectingPictures: selectedPictures.length > 0 })
                                                    } else
                                                        this.setState({ selectedPictures: [...this.state.selectedPictures, `${id}/${photo}`] })
                                                }}>
                                                <ImageBackground source={{ uri: `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${photo}` }} style={{ width: d.width * 0.245, height: d.width * 0.245, margin: d.width * 0.002 }}>
                                                    <View style={{ alignItems: "flex-start", justifyContent: this.state.selectingPictures && (id == "unknown" || id.split("_")[0] == "unknown" || !types || types?.length == 0) ? "space-between" : "flex-end", paddingBottom: d.width * 0.002, marginTop: ci < 5 ? 0 : d.width * 0.002, width: "100%", height: "100%", backgroundColor: this.state.selectedPictures.indexOf(`${id}/${photo}`) > -1 ? "#ad0a4c55" : "#00000000" }}>
                                                        {(id == "unknown" || id.split("_")[0] == "unknown" || !types || types?.length == 0) && <Icon name="map-marker-plus" size={16} color="#ad0a4c" />}
                                                        {this.state.selectedPictures.indexOf(`${id}/${photo}`) > -1 ? <Icon name="checkbox-marked" size={20} color="#ad0a4c" style={{ alignSelf: "flex-end" }} /> : this.state.selectingPictures ? <Icon name="checkbox-blank-outline" size={20} color="#ad0a4c" style={{ alignSelf: "flex-end" }} /> : null}
                                                    </View>
                                                </ImageBackground>

                                            </TouchableOpacity>)
                                        .reduce((pv, cv, ci, arr) => pv.length < arr.length ? arr.slice().concat(Array(4 - arr.length % 4).fill(<View style={{ width: d.width * 0.25, height: d.width * 0.25 }}></View>)) : pv, []);
                                    return images;
                                })()}
                                <View style={{ height: d.height * 0.3, width: d.width }}></View>
                            </ScrollView>

                        )
                }

                {this.state.selectingPictures && <View style={{ width: d.width, backgroundColor: "white", flexDirection: "row", justifyContent: "space-evenly", height: 85, position: "absolute", top: d.height - 80, alignItems: "flex-start" }}>
                    <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }} onPress={() => {

                    }}>
                        <Icon name="map-marker" size={28} color="#242424" />
                        <Text>Geo tag</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }} onPress={async () => {
                        this.state.selectedPictures.map(pic => console.log)
                        console.log(this.state.selectedPictures.map(pic => `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`))

                        let files = await Promise.all(this.state.selectedPictures.map(pic => RNFetchBlob.fs.readFile(`file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`, "base64")));

                        console.log(files);

                        Share.open({ urls: files.map((file: string) => `data:image/png;base64,${file}`), })
                            .then((res) => { console.log(res) })
                            .catch((err) => { err && console.log(err); });
                    }}>
                        <Icon name="share-variant" size={28} color="#242424" />
                        <Text>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }} onPress={() => {
                        let files = this.state.selectedPictures.map(pic => `file://${RNFetchBlob.fs.dirs.SDCardDir}/Iter/${pic.split("/")[1]}`);
                        CameraRoll.deletePhotos(files)
                        files.map(file => RNFetchBlob.fs.unlink(file))

                        let newMarkers = [];
                        this.state.markers.forEach(marker => {
                            this.state.selectedPictures.forEach(pic => {
                                let i = marker.pictures.indexOf(pic.split("/")[1])
                                if (i > -1)
                                    marker.pictures = [...marker.pictures.slice(0, i), ...marker.pictures.slice(i + 1)]
                            });

                            if (marker.pictures.length > 0)
                                newMarkers.push(marker);
                        })

                        this.props.data.liveRoutesTracking.forEach(({ id, tracking }) => {
                            if (tracking) {
                                AsyncStorage.getItem(`live_${id}`, (err, res) => {
                                    let liveRoute :ILiveRoute = JSON.parse(res);

                                    liveRoute.markers = newMarkers;

                                    AsyncStorage.setItem(`live_${id}`, JSON.stringify(liveRoute), (error) => {
                                        error && console.log(error)
                                    });
                                })
                            }
                        });

                        this.setState({ markers: newMarkers });
                    }}>
                        <Icon name="delete" size={28} color="#242424" />
                        <Text>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }} onPress={() => {
                        this.setState({ selectedPictures: [], selectingPictures: false })
                    }}>
                        <Icon name="close" size={28} color="#242424" />
                        <Text>Cancle</Text>
                    </TouchableOpacity>
                </View>}
            </View >
        );
    }
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#242424",
        color: "white",
        justifyContent: "center",
        borderBottomWidth: 4,
        borderBottomColor: "#242424",
    },
    buttonText: {
        width: d.width / 3,
        fontSize: 16,
        lineHeight: 16,
        height: 44,
        color: "white",
        textAlignVertical: "center",
        textAlign: "center",
        fontWeight: "bold",
    },
});

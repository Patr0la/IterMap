import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, PermissionsAndroid, Dimensions, TouchableOpacity, TextInput, Platform } from "react-native";

import Geolocation from "react-native-geolocation-service";

import { Search } from "../Components/Search";
import { RoutesPreview } from "../Components/RoutesPreview";
import { PageNavigator } from "../Components/PageNavigator";
import AsyncStorage from "@react-native-community/async-storage";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ScrollView } from "react-native-gesture-handler";

interface Props extends IProps {}

interface State {
    creatingNew: boolean;
    newRouteName: string;
}

export class LiveRouteManage extends React.Component<Props, State> {
    static navigationOptions = {
        drawerLabel: "Home",
        //drawerIcon: ({ tintColor }) => <Image style={[styles.icon, { tintColor: tintColor }]} />,
    };

    anim;
    constructor(props: Props) {
        super(props);
        PermissionsAndroid.request("android.permission.ACCESS_FINE_LOCATION");
        Geolocation.requestAuthorization();

        this.state = {
            creatingNew: false,
            newRouteName: "",
        };
    }

    Searchbar: Search;
    render() {
        return (
            <View style={{ ...StyleSheet.absoluteFillObject }}>
                <ScrollView>
                    {this.props.data.liveRoutesTracking?.map(({ id, name, tracking }, i, arr) => (
                        <View style={styles.liveRoute} key={id}>
                            <TouchableOpacity
                                style={{height: 45, width: "80%", alignContent: "center", flexDirection: "column", justifyContent: "center" }}
                                onPress={() => {
                                    this.props.navigation.navigate("LiveRoute", { id, routeName: name });
                                }}
                            >
                                <Text style={{lineHeight: 18, fontSize: 18, height: 20}}>{name}</Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: "row" }}>
                                <TouchableOpacity onPress={() => {
                                    let temp = arr.slice();
                                    temp.splice(i, 1, ...[{id, name, tracking: !tracking}] );
                                    this.props.data.liveRoutesTracking = temp;
                                    this.forceUpdate();
                                }}>
                                {tracking ? <Icon name="pause" size={42} color="#242424" /> :  <Icon name="play" size={42} color="#242424" />}
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Icon name="stop" size={42} color="#242424" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )) ?? []}
                    <View style={{ height: d.width * 0.25, width: "100%" }}></View>
                </ScrollView>
                {this.state.creatingNew && (
                    <View style={styles.dialog}>
                        <View>
                            <Text style={{ fontSize: 18, color: "#242424" }}>Create new live route</Text>
                            <TextInput onChangeText={newRouteName => this.setState({ newRouteName })} placeholder="Route name" style={{ borderBottomColor: "#ad0a4c", borderBottomWidth: 1, marginTop: 10 }} placeholderTextColor="#aaaaaa" value={this.state.newRouteName}></TextInput>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                            <TouchableOpacity
                                style={{ backgroundColor: "#ad0a4c", padding: "5%", borderRadius: 10 }}
                                onPress={() => {
                                    this.setState({ creatingNew: !this.state.creatingNew });
                                    this.setState({ newRouteName: "" });
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 16 }}>Cancle</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={1}
                                style={{ backgroundColor: "#ad0a4c", padding: "5%", borderRadius: 10 }}
                                onPress={() => {
                                    let id = new Date().getTime().toString();
                                    this.props.data.liveRoutesTracking = [...(this.props.data.liveRoutesTracking ?? []), { id, name: this.state.newRouteName, tracking: true }];
                                    let route: ILiveRoute = {
                                        localId: id,

                                        name: this.state.newRouteName,
                                        path: [],
                                        markers: [],

                                        share: false,
                                        latency: 0,
                                        latencyUnit: "h",
                                    };

                                    AsyncStorage.setItem(`live_${id}`, JSON.stringify(route), err => {
                                        if (err) console.error(err);
                                    });
                                    this.setState({ newRouteName: "", creatingNew: false });
                                    this.props.navigation.navigate("LiveRoute", { id });
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 16 }}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {!this.state.creatingNew && (
                    <TouchableOpacity style={{ position: "absolute", bottom: d.width * 0.05, right: d.width * 0.05, borderRadius: 30, backgroundColor: "#ad0a4c", width: 60, height: 60, alignItems: "center", flexDirection: "row", justifyContent: "center" }} onPress={() => this.setState({ creatingNew: !this.state.creatingNew })}>
                        <Icon name="plus" color="white" size={42} />
                    </TouchableOpacity>
                )}
            </View>
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
    liveRoute: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        width: "90%",
        marginLeft: "5%",

        backgroundColor: "#fff",
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: "5%",
        paddingRight: "5%",

        marginTop: 7,
        marginBottom: 12,
        borderRadius: 4,

        ...Platform.select({
            android: {
                shadowColor: "#aaaaaa",
                elevation: 5,
            },
            ios: {
                shadowColor: "#aaaaaa",
                shadowOpacity: 1,
                shadowOffset: { height: 5, width: 5 },
                shadowRadius: 4,
            },
        }),
    },
    dialog: {
        backgroundColor: "white",

        flexDirection: "column",
        justifyContent: "space-between",

        position: "absolute",
        width: d.width * 0.7,
        left: d.width * 0.15,
        height: d.height * 0.3,
        top: d.height * 0.1,

        ...Platform.select({
            android: {
                elevation: 20,
            },
            ios: {
                shadowColor: "#242424",

                shadowOffset: { width: 0, height: 0.8 * 20 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
        }),

        padding: "5%",
        borderRadius: 10,
    },
});

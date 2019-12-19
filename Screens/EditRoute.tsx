import React from "react";
import { EditMap } from "../Components/EditMap";
import { MarkerList } from "../Components/MarkerList";
import { View, Button, TextInput, StyleSheet, Text, Dimensions, StatusBarIOS, StatusBar } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import * as config from "../Config.json";
import { Search } from "../Components/Search";

interface Props extends IProps { }

interface State extends IRoute {
    loaded: boolean;

    editing: "route" | "markers";
}

export class EditRoute extends React.Component<Props, State> {
    private editMap: EditMap;
    private markerList: MarkerList;

    private loadingId: string;
    private loaded: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            loaded: false,
            editing: "markers",
        };

        this.addMarker.bind(this);
        this.onMarkerUpdate.bind(this);
    }

    public LoadRoute(id: string) {
        fetch(`http://${config.host}/getRouteData?id=${id}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Cookie: `session=${this.props.data.token}`,
                "Content-Type": "application/json",
            },
        })
            .then(res => res.json())
            .then((route: IRoute) => {
                /*route.markers = [
                    {
                        pictures: [],
                        pos: { latitude: 45, longitude: 12 },
                        title: "1",
                    },
                    { pictures: [], pos: { latitude: 44.5, longitude: 14.5 }, title: "2" },
                    { pictures: [], pos: { latitude: 44.45, longitude: 14.6 }, title: "3" },
                    { pictures: [], pos: { latitude: 44.6, longitude: 14.8 }, title: "4" },
                    { pictures: [], pos: { latitude: 45.1, longitude: 14.8 }, title: "5" },
                ];*/
                this.setState({ ...route, loaded: true });
                this.editMap.setState({ ...route });
                this.markerList.setState({ markers: route.markers });
                this.loaded = true;

                fetch(`http://${config.host}/getRouteDirections?id=${id}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Cookie: `session=${this.props.data.token}`,
                        "Content-Type": "application/json",
                    },
                })
                    .then(res => res.json())
                    .then((path: Array<IPos>) => {
                        this.setState({ path });
                    });
            });
    }

    addMarker(pos: IPos) {
        console.log(this);
        this.onMarkerUpdate([
            ...this.state.markers,
            {
                pictures: [],
                pos: pos,
                title: "Untitled",
                description: "",
                price: { currency: "€", value: 0 },
                time: "",
                id: `marker_${(new Date()).getTime()}`,
                types: []
            },
        ]);
    }

    onMarkerUpdate(markers: Array<IMarker>) {
        this.setState({ markers });
        this.editMap.setState({ markers });
        this.markerList.setState({ markers });

        fetch(`http://${config.host}/setMarkersForRoute`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Cookie: `session=${this.props.data.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: this.state._id,
                markers,
            }),
        }).then(res => {
            fetch(`http://${config.host}/getRouteDirections?id=${this.state._id || this.props.navigation.getParam("id", "undefined")}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Cookie: `session=${this.props.data.token}`,
                    "Content-Type": "application/json",
                },
            })
                .then(res => res.json())
                .then((path: Array<IPos>) => {
                    this.setState({ path });
                    this.editMap.setState({ path });
                });
        });
    }

    searchForPlace(querry: string) { }

    render() {
        let id = this.props.navigation.getParam("id");
        if (id != this.state._id && id != this.loadingId) {
            this.loadingId = id;
            this.loaded = false;

            this.LoadRoute(id);
        }

        return (
            <View>
                <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                    <TouchableOpacity
                        style={{
                            ...styles.button,
                            ...(this.state.editing == "route" ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}),
                        }}
                        onPress={() => this.setState({ editing: "route" })}
                    >
                        <Text style={styles.buttonText}>Route</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ ...styles.button, ...(this.state.editing == "markers" ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}) }}
                        onPress={() => {
                            this.setState({ editing: "markers" });
                            this.LoadRoute(this.state._id);
                        }}
                    >
                        <Text style={styles.buttonText}>Locations</Text>
                    </TouchableOpacity>
                </View>

                {this.state.editing == "route" ? (
                    <View>
                        <TextInput style={styles.textInput} value={this.state.title} onChangeText={title => this.setState({ title })}></TextInput>
                    </View>
                ) : (
                        <View style={{ width: "100%", height: "100%" }}>
                            <Search
                                endpoint="findLocation"
                                navigation={this.props.navigation}
                                data={this.props.data}
                                requestPrepeareCallback={async () => {
                                    let { center } = await this.editMap.MapView.getCamera();
                                    return { lat: center.latitude, lng: center.longitude };
                                }}
                                onSelectCallback={selection => {
                                    console.log(selection);
                                }}
                                placeHolder="Search for places.."
                            />
                            <EditMap ref={ref => (this.editMap = ref)} addMarker={pos => this.addMarker(pos)} data={this.props.data}></EditMap>
                            <MarkerList
                                ref={ref => (this.markerList = ref)}
                                routeId={this.state._id}
                                onMarkerUpdate={markers => {
                                    this.onMarkerUpdate(markers);
                                }}
                                markers={this.state.markers}
                                Map={this.editMap}
                                data={this.props.data}
                                navigation={this.props.navigation}
                            ></MarkerList>
                        </View>
                    )}
            </View>
        );
    }
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
    textInput: {
        borderColor: "#aaaaaa",
        borderWidth: 2,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
    },
    button: {
        backgroundColor: "#242424",
        color: "white",
        justifyContent: "center",
    },
    buttonText: {
        width: d.width / 2,
        fontSize: 16,
        lineHeight: 16,
        height: 44,
        color: "white",
        textAlignVertical: "center",
        textAlign: "center",
        fontWeight: "bold",
    },
    addMainImage: {
        height: 128,
        width: 128,
        justifyContent: "center",
        flexDirection: "column",
    },
});

import React from "react";
import { EditMap } from "./EditMap";
import { PanResponderInstance, Dimensions, PanResponder, ScrollView, View, Text, StyleSheet, Platform } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons"

import { BetterImage } from "./BetterImage";

import * as config from "../Config.json";

interface Props extends IProps {
    routeId: string;
    
    i: number;

    map: EditMap;
    markers: Array<IMarker>;
    markerElements: Array<Marker>;

    onMarkerUpdate: (markers: Array<IMarker>) => void;

    scrollFor: (n: number) => void;
}

interface State {
    i: number;
    top: number;

    markers: Array<IMarker>;
    markerElements: Array<Marker>;

    lastPosition: number;
    canCallScrollTo: boolean;
    exists: boolean;

}

export class Marker extends React.Component<Props, State> {
    _panResponder: PanResponderInstance;
    constructor(props: Props) {
        super(props);

        this.state = {
            i: props.i,
            markers: props.markers,
            markerElements: props.markerElements,

            top: props.i * 80,
            lastPosition: 0,
            canCallScrollTo: true,

            exists: true,

        };

        const miniMoveX = d.width - 90;
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (e, gs) => e.nativeEvent.pageX > miniMoveX,
            onStartShouldSetPanResponderCapture: (e, gs) => e.nativeEvent.pageX > miniMoveX,
            onMoveShouldSetPanResponder: (e, gs) => e.nativeEvent.pageX > miniMoveX,
            onMoveShouldSetPanResponderCapture: (e, gs) => e.nativeEvent.pageX > miniMoveX,
            onPanResponderTerminationRequest: (e, gs) => false,
            onShouldBlockNativeResponder: (e, gs) => true,

            onPanResponderGrant: (e, gs) => {
                this.props.map.MapView.fitToCoordinates(this.state.markers.slice(this.state.i - 2 >= 0 ? this.state.i - 2 : 0, this.state.i + 3 < this.state.markers.length ? this.state.i + 3 : this.state.markers.length).map(m => m.pos), {
                    animated: true,
                    edgePadding: { bottom: 40, top: 40, left: 40, right: 40 },
                });
                console.log("start");
                this.setState({ lastPosition: e.nativeEvent.pageY });
            },
            onPanResponderMove: (e, gs) => {
                let dy = e.nativeEvent.pageY - this.state.lastPosition;

                this.setState({ top: this.state.top + dy, lastPosition: e.nativeEvent.pageY });
                if (this.state.canCallScrollTo) {
                    if (e.nativeEvent.pageY > d.height * 0.9) {
                        this.props.scrollFor(100);
                        this.setState({ top: this.state.top + 100, lastPosition: e.nativeEvent.pageY, canCallScrollTo: false });
                        setTimeout(() => {
                            this.setState({ canCallScrollTo: true });
                        }, 1000);
                    }
                }

                let ni = Math.ceil(this.state.top / 80 - 0.5);
                if (this.state.i < ni && ni < this.state.markers.length) {
                    let _still = this.state.markers.slice(0, this.state.i);
                    let _toMove = this.state.markers.slice(this.state.i + 1, ni + 1);
                    let _end = this.state.markers.slice(ni + 1, this.state.markers.length);

                    let markers = [..._still, ..._toMove, this.state.markers[this.state.i], ..._end];

                    let still = this.state.markerElements.slice(0, this.state.i);
                    let toMove = this.state.markerElements.slice(this.state.i + 1, ni + 1);
                    let end = this.state.markerElements.slice(ni + 1, this.state.markers.length);

                   
                    let markerElements = [...still, ...toMove, this.state.markerElements[this.state.i], ...end];

                    still.forEach(m => {
                        m.setState({
                            markers: markers,
                            markerElements: markerElements,
                        });
                    });

                    end.forEach(m => {
                        m?.setState({
                            markers: markers,
                            markerElements: markerElements,
                        });
                    });

                    toMove.forEach(m => {
                        m.setState({
                            top: (m.state.i - 1) * 80,
                            i: m.state.i - 1,
                            markers: markers,
                            markerElements: markerElements,
                        });

                        console.log(m.state);
                    });

                    this.setState({
                        markers: markers,
                        markerElements: markerElements,
                        i: ni,
                    });

                    this.props.onMarkerUpdate(markers);

                    this.props.map.MapView.fitToCoordinates(markers.slice(ni - 2 >= 0 ? ni - 2 : 0, ni + 3 < markers.length ? ni + 3 : markers.length).map(m => m.pos), {
                        animated: true,
                        edgePadding: { bottom: 40, top: 40, left: 40, right: 40 },
                    });
                } else if (this.state.i > ni && ni >= 0) {
                    let _still = this.state.markers.slice(0, ni);
                    let _toMove = this.state.markers.slice(ni, this.state.i);
                    let _end = this.state.markers.slice(this.state.i + 1, this.state.markers.length);

                    let still = this.state.markerElements.slice(0, ni);
                    let toMove = this.state.markerElements.slice(ni, this.state.i);
                    let end = this.state.markerElements.slice(this.state.i + 1, this.state.markerElements.length);

                    let markers = [..._still, this.state.markers[this.state.i], ..._toMove, ..._end];
                    let markerElements = [...still, this.state.markerElements[this.state.i], ...toMove, ...end];

                    still.forEach(m => {
                        if (m)
                            m.setState({
                                markers: markers,
                                markerElements: markerElements,
                            });
                    });

                    end.forEach(m => {
                        if (m)
                            m.setState({
                                markers: markers,
                                markerElements: markerElements,
                            });
                    });

                    toMove.forEach(m => {
                        m.setState({
                            top: m.state.top + 80,
                            i: m.state.i + 1,
                            markers: markers,
                            markerElements: markerElements,
                        });
                    });

                    this.setState({
                        markers: markers,
                        markerElements: markerElements,
                        i: ni,
                    });

                    this.props.onMarkerUpdate(markers);

                    this.props.map.MapView.fitToCoordinates(markers.slice(ni - 2 >= 0 ? ni - 2 : 0, ni + 3 < markers.length ? ni + 3 : markers.length).map(m => m.pos), {
                        animated: true,
                        edgePadding: { bottom: 40, top: 40, left: 40, right: 40 },
                    });
                }
            },
            onPanResponderRelease: (e, gs) => {
                this.setState({
                    top: this.state.i * 80,
                });
            },
            onPanResponderTerminate: (e, gs) => {},
        });
    }

    render() {
        if(!this.state.exists || !this.state || !this.state.markers[this.state.i]) return null;
        return (
            <View onTouchEnd={e => e.nativeEvent.pageX < d.width - 90 && this.props.map.MapView.animateCamera({center: this.state.markers[this.state.i].pos})} {...this._panResponder.panHandlers} style={{ ...styles.marker, top: this.state.top }}>
                {this.state.markers[this.state.i].pictures[0] && <BetterImage url={`http://${config.host}/routeImages?route=${this.props.routeId}&image=${this.state.markers[this.state.i].pictures[0]}`} imageSource="web" cacheImage={false} imageStyle={{ width: 32, height: 32, borderRadius: 16 }} parentViewStyle={{ width: 32, height: 32 }} data={this.props.data} navigation={this.props.navigation}></BetterImage>}
                <Text
                    onPress={() => {
                        this.props.map.MapView.animateCamera({center: this.state.markers[this.state.i].pos});
                    }}
                    style={{ flexGrow: 10, marginLeft: 6, color:"#242424" }}
                >
                    {this.state.markers[this.state.i].title}
                </Text>
                <View onTouchEnd={() => {
                    let _still = this.state.markers.slice(0, this.state.i);
                    let _toMove = this.state.markers.slice(this.state.i + 1, this.state.markers.length);

                    let still = this.state.markerElements.slice(0, this.state.i);
                    let toMove = this.state.markerElements.slice(this.state.i + 1, this.state.markers.length);

                    let markers = [..._still, ..._toMove];
                    let markerElements = [...still, ...toMove];


                    this.props.onMarkerUpdate(markers);
                }}>
                    <Icon name="close" size={32} color="red"/>
                </View>
                <View
                    onTouchEnd={() => {
                        this.props.navigation.navigate("MarkerEditScreen", {
                            data: { ...this.state.markers[this.state.i], routeId: this.props.routeId },
                            callback: (data: IMarker) => {
                                let newMarker: IMarker = {
                                    description: data.description,
                                    pos: data.pos,
                                    price: data.price,
                                    time: data.time,
                                    pictures: data.pictures,
                                    title: data.title,
                                };

                                let markers = [...this.state.markers.slice(0, this.state.i), newMarker, ...this.state.markers.slice(this.state.i + 1)].reduce((pv, cv) => cv ? pv.concat(cv) : pv, []);
                                let markerElements = [...this.state.markerElements.slice(0, this.state.i), this, ...this.state.markerElements.slice(this.state.i + 1)].reduce((pv, cv) => cv ? pv.concat(cv) : pv, []);;

                                markerElements.forEach(m => m.setState({markers, markerElements}));
                                //this.setState({ markers, markerElements });
                                this.props.onMarkerUpdate(markers);
                            },
                        });
                    }}
                >
                    <Icon name="pencil" size={32} color="#242424"></Icon>
                </View>
                <View style={{ width: 60, height: 60, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
                        <Icon name="menu" size={40} color="#242424"></Icon>
                    </Text>
                </View>
            </View>
        );
    }
}

const d = Dimensions.get("screen");


const styles = StyleSheet.create({
    marker: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        position: "absolute",
        width: "90%",
        marginLeft: "5%",

        backgroundColor: "#fff",
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        height: 60,
        flex: 1,
        marginTop: 7,
        marginBottom: 12,
        borderRadius: 4,

        ...Platform.select({
            android: {
                shadowColor: "#aaaaaa",
                elevation: 5
            },
            ios:{
                shadowColor: "#aaaaaa",
                shadowOpacity: 1,
                shadowOffset: { height: 5, width: 5 },
                shadowRadius: 4,
            }
        })
    },
});

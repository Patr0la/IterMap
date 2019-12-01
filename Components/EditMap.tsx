import React from "react";
import { View, Platform, StyleSheet, Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";

import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { BetterImage } from "./BetterImage";

import * as config from "../Config.json";
import { MapStyle } from "../MapStyle";

interface Props extends IProps, IRoute {
    addMarker: (pos: IPos) => void;
}

interface State extends IRoute {}

export class EditMap extends React.Component<Props, State> {
    public MapView : MapView;

    constructor(props: Props) {
        super(props);

        this.state = {
            ...props,
        };
    }

    markersOnMap: Array<JSX.Element>;
    loaded: boolean;
    render() {
        if(this.state.markers) this.markersOnMap = this.state.markers.map((m, i) => 
            <Marker coordinate={m.pos} key={i}>
                <View style={{width:56, height: 56}}>
                     <Icon name="map-marker" size={56} style={{position: "absolute", /*marginTop: 5*/}} color="#242424"/>
                    { m.pictures && m.pictures[0] && 
                        <BetterImage
                        url={`http://${config.host}/routeImages?route=${this.state._id}&image=${m.pictures[0]}`} imageSource="web" cacheImage={false}
                        imageStyle={{width:32, height: 32, borderRadius: 16,}}
                        parentViewStyle={{width: 32, height: 32, marginLeft: 12, marginTop: 6}}
                        data={this.props.data}
                        navigation={this.props.navigation}>
                    </BetterImage>}
                </View>
            </Marker>
        );

        if(this.MapView && (this.state.path?.length > 2 || this.state.livePath?.length) ) {
            this.MapView.fitToCoordinates(this.state.path?.length > 2? this.state.path : this.state.livePath, {animated: false, edgePadding: {bottom: 50, left: 50, right: 50, top: 50}});

        }

        return (
            <View style={{width: "100%", height: d.height / 2}}>
                <MapView
                    cacheEnabled
                    onPoiClick={e => alert(e.nativeEvent.name)}
                    ref={ref => (this.MapView = ref)}
                    //onLayout={() => this.props.onMapLayout()}
                    style={styles.map}
                    mapType="satellite"
                    //customMapStyle={MapStyle}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: this.state && this.state.lastMapPosition ? this.state.lastMapPosition.latitude : 0,
                        longitude: this.state && this.state.lastMapPosition ? this.state.lastMapPosition.longitude : 0,
                        latitudeDelta: 0.04,
                        longitudeDelta: 0.02,
                    }}
                    onPress={e => {
                        this.props.addMarker(e.nativeEvent.coordinate);
                    }}
                    onMarkerPress={e => {
                        console.log(e);
                    }}
                    onLayout={e => this.state.path?.length > 2 ? this.MapView.fitToCoordinates(this.state.path, {animated: false, edgePadding: {bottom: 50, left: 50, right: 50, top: 50}}) : this.state.livePath?.length ? this.MapView.fitToCoordinates(this.state.livePath, {animated: false, edgePadding: {bottom: 50, left: 50, right: 50, top: 50}}) : null}
                >
                {this.markersOnMap}
                {this.state && this.state.path && this.state.path.length > 1 && <Polyline coordinates={this.state.path} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}
                {this.state && this.state.livePath && this.state.livePath.length > 1 && <Polyline coordinates={this.state.livePath} strokeColor="#AD0A4C" strokeWidth={6}></Polyline>}
                </MapView>
            </View>
       );
    }
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
    textInput: {
        width: "100%",
    },
    picker: {
        height: 50,
        width: 50,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eee",

        ...Platform.select({
            ios: {
                paddingTop: 20,
            },
        }),
    },

    title: {
        fontSize: 20,
        paddingVertical: 20,
        color: "#999999",
    },

    list: {
        flex: 1,
    },

    contentContainer: {
        width: d.width,

        ...Platform.select({
            ios: {
                paddingHorizontal: 30,
            },

            android: {
                paddingHorizontal: 0,
            },
        }),
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        height: 80,
        flex: 1,
        marginTop: 7,
        marginBottom: 12,
        borderRadius: 4,

        ...Platform.select({
            ios: {
                width: d.width - 30 * 2,
                shadowColor: "rgba(0,0,0,0.2)",
                shadowOpacity: 1,
                shadowOffset: { height: 2, width: 2 },
                shadowRadius: 2,
            },

            android: {
                width: d.width - 30 * 2,
                elevation: 0,
                marginHorizontal: 30,
            },
        }),
    },

    image: {
        width: 50,
        height: 50,
        marginRight: 30,
        borderRadius: 25,
    },

    text: {
        fontSize: 24,
        color: "#222222",
    },
});

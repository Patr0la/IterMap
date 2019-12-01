import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, PermissionsAndroid, Dimensions, TouchableOpacity, TextInput } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Search } from "../Components/Search";
import { RoutesPreview } from "../Components/RoutesPreview";

import { PageNavigator } from "../Components/PageNavigator";
import MapView, { PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { MapStyle } from "../MapStyle";
import AsyncStorage from "@react-native-community/async-storage";
import { ScrollView } from "react-native-gesture-handler";

import ViewPager from "@react-native-community/viewpager";

import * as config from "../Config.json";

interface Props extends IProps {
    navigatedTo?: boolean;
    id?: string;
    ids?: Array<string>;
    pageMove? : () => void;
}

interface State extends ILiveRoute {
    viewing: "back" | "route" | "stats" | "gallery";
    id?: string;
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
        };
    }

    calculateRoutePoints(route: ILiveRoute) {
        let average = route.path.reduce((total, {accuracy}) => total+accuracy, 0)/route.path.length;

        let path = route.path.filter(({accuracy}) => accuracy < average);
        return path;
    }

    MapView: MapView;
    lastUpdateTime : number = 0;
    pageNavigator:PageNavigator;
    render() {
        if(this.props.navigatedTo){
        let id :string = this.props.navigation.getParam("id", undefined);
        let cTime = (new Date()).getTime();
        if((id && id != this.state.localId) || cTime - 5000 > this.lastUpdateTime){
            AsyncStorage.getItem(`live_${id}`, (err, res) => {
                if(err) console.error(err);

                let route :ILiveRoute = JSON.parse(res);
                route.path = this.calculateRoutePoints(route);
                this.setState({...route})

                this.lastUpdateTime = cTime;
            });
        }}
        else{
            AsyncStorage.getItem(`live_${this.props.id}`, (err, res) => {
                if(err) console.error(err);

                let route :ILiveRoute = JSON.parse(res);
                route.path = this.calculateRoutePoints(route);
                this.setState({...route})
            });
        }

        return (
            <View>
                <View></View>
                <PageNavigator
                ref={ref => this.pageNavigator = ref}
                    default = "route"
                    routes={[
                        {
                            title: <Icon name="arrow-left" size={26} color="white" style={{alignSelf: "center"}}/>,
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
                        if(viewing == "back"){
                            this.pageNavigator.setState({viewing: this.state.viewing})
                            this.props.pageMove();
                        }
                        else
                            this.setState({viewing})}

                    }
                />

            
                {this.state.viewing == "route" ? (
                    <View style={{width: "100%", height: "100%"}}>
                        <MapView
                            cacheEnabled
                            onPoiClick={e => alert(e.nativeEvent.name)}
                            ref={ref => (this.MapView = ref)}
                            //onLayout={() => this.props.onMapLayout()}
                            style={{width: "100%", height: "100%"}}
                            customMapStyle={MapStyle}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: this.props.data.lastLocation.pos.latitude || 0,
                                longitude: this.props.data.lastLocation.pos.longitude || 0,
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
                        </MapView>
                    </View>
                ) : (
                    <View>
                    </View>
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
});

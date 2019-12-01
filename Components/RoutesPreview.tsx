import React from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput, Picker, PickerItem, ViewPropTypes, ActivityIndicator, ListViewBase, ListViewComponent } from "react-native";

import * as config from "../Config.json";
import { BetterImage } from "./BetterImage";
import { TraveledBy } from "./TraveledBy";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FlatList } from "react-native-gesture-handler";
import { RoutePost } from "./RoutePost";

interface Props extends IProps {
    routeData: Array<IRoute>;
}

interface State extends IRoute {
    //title: string;
    //votes: string;

    routeData: Array<IRoute>;
}
export class RoutesPreview extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            routeData: this.props.routeData,
        };
    }

    render() {
        if (this.state && this.state.routeData) {
            // TODO Implement image CDmN
            return (
                <FlatList
                    renderItem={route => {
                        return <RoutePost {...route.item} navigation={this.props.navigation} data={this.props.data}></RoutePost>;
                    }}
                    data={this.state.routeData}
                    keyExtractor={a => a._id}
                    style={styles.view}
                ></FlatList>
            );
        } else {
            return (
                <View>
                    <ActivityIndicator animating={true}></ActivityIndicator>
                </View>
            );
        }
    }
}

//const IMAGE_HIGHT

const styles = StyleSheet.create({
    view: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        backgroundColor: "#676767",
    },
    title: {
        fontFamily: "DejaVuSerif-Bold",
        fontSize: 24,
        color: "white",
        marginLeft: 10,
    },
    madeBy: {
        fontFamily: "DejaVuSerif",
        color: "#aaaaaa",
        fontSize: 18,
        marginTop: 6,
        flexGrow: 1,
    },
    image: {
        //position: "absolute",
        //left: 0,
        //right: 0,
        //top: 0,
        //bottom: 0,
        width: "100%",
        height: "100%",
    },
    header: {
        display: "flex",
        //position: "absolute",
        justifyContent: "space-between",
        flexDirection: "row",
    },
    info: {
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "row",
        height: 100,
        backgroundColor: "red",
        width: "100%",
    },
});

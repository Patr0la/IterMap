import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, PermissionsAndroid, Dimensions, TouchableOpacity, TextInput, Platform, Keyboard } from "react-native";

import Geolocation from "react-native-geolocation-service";

import { SearchBox, TypeToIcon } from "../Components/SearchBox";
import { RoutesPreview } from "../Components/RoutesPreview";
import { PageNavigator } from "../Components/PageNavigator";
import AsyncStorage from "@react-native-community/async-storage";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ScrollView } from "react-native-gesture-handler";

import * as config from "../Config.json";

interface Props extends IProps {
    menu?: boolean;

    placeHolder: string;

    requestPrepeareCallback?: () => any;
    onSelectCallback: (selection: { name: string; value: any, types?: any, latitude?: number, longitude?: number }) => void;

    endpoint: string;
}

interface State {

    text: string;
    resoults: Array<{ name: string; value: string; type: string }>;

}

export class Search extends React.Component<Props, State> {

    anim;
    constructor(props: Props) {
        super(props);
        PermissionsAndroid.request("android.permission.ACCESS_FINE_LOCATION");
        Geolocation.requestAuthorization();

        this.state = {
            resoults: [],
            text: ""
        };
    }

    session: string;

    querry(querry: string) {
        if (querry.length < 3) {
            this.session = `${(new Date()).getTime()}_${querry.substr(0, 3)}`
            return;
        }

        fetch(`http://${config.host}/${this.props.endpoint}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Cookie: `session=${this.props.data.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ querry, ...(this.props.requestPrepeareCallback ? this.props.requestPrepeareCallback() : {}), session: this.session }),
        })
            .then(res => res.json())
            .then(resoults => {
                this.setState({ resoults });
            });
    }

    Searchbar: SearchBox;
    render() {
        return (
            <View
                style={{
                    marginTop: "2.5%",
                    height: d.height,
                    width: d.width,
                    backgroundColor: "#323232",
                    position: "absolute",
                    zIndex: 10
                }}
            >
                {this.state.resoults.map(r => (
                    <TouchableOpacity
                        style={{ flexDirection: "row", justifyContent: "space-between", height: 30, alignItems: "center", alignContent: "center", marginLeft: "5%", marginRight: "5%", marginTop: "5%" }}
                        onPress={() => {

                            console.log(this.props.endpoint);

                            if (this.props.endpoint == "findLocation")
                                fetch(`http://${config.host}/findLocationGetLocationData`, {
                                    method: "POST",
                                    headers: {
                                        Accept: "application/json",
                                        Cookie: `session=${this.props.data.token}`,
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: r.value, session: this.session }),
                                })
                                    .then(res => res.json())
                                    .then((pos: IPos) => {
                                        console.table(pos)
                                        this.props.onSelectCallback({ ...r, ...pos });
                                    });
                            else
                                this.props.onSelectCallback(r);

                            this.setState({ text: "", resoults: [] });
                            Keyboard.dismiss();
                        }}
                    >
                        <Text style={{ color: "#aaaaaa" }}>{r.name}</Text>
                        {r.type && TypeToIcon[r.type] && <Icon name={TypeToIcon[r.type]} size={22} color="#aaaaaa" style={{ alignSelf: "center" }} />}
                    </TouchableOpacity>
                ))}
            </View>
        );
    }
}

const d = Dimensions.get("screen");

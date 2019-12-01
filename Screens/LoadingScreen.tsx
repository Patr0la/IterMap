import React from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput } from "react-native";
import { DataKeys } from "../UserData";

import * as config from "../Config.json";

interface State {}

export class LoadingScreen extends React.Component<IProps, State> {
    constructor(props: IProps) {
        super(props);

        let canNavigateToHome = false;
        props.data.initilize(
            () => {
                if (props.data.token) {
                    if (canNavigateToHome) {
                        if (props.data.liveRoutesTracking) props.navigation.navigate("Home");
                        else props.navigation.navigate("Home");
                    } else canNavigateToHome = true;
                } else {
                    props.navigation.navigate("Login");
                }
            },
            () => {
                if (canNavigateToHome) {
                    if (props.data.liveRoutesTracking) props.navigation.navigate("Home");
                    else props.navigation.navigate("Home");
                } else canNavigateToHome = true;
            }
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <Text> Loading ...</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
});

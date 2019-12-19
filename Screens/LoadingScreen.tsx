import React from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput } from "react-native";
import { DataKeys } from "../UserData";

import * as config from "../Config.json";

interface State { }

export class LoadingScreen extends React.Component<IProps, State> {
    constructor(props: IProps) {
        super(props);

        let canNavigateToHome = false;
        let goneHome = false;
        props.data.initilize(
            () => {
                if (props.data.token) {
                    props.navigation.navigate("Home");
                    goneHome = true;
                } else {
                    props.navigation.navigate("Login");
                }
            },
            () => {
                console.log("Loaction setup")
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

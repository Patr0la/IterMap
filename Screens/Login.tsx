import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput, Keyboard, Dimensions } from "react-native";

import * as config from "../Config.json";
import { BetterImage } from "../Components/BetterImage";

const sha = require("../sha");

interface Props extends IProps {

}

interface State {
    username: string;
    password: string;
}

export class Login extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.login = this.login.bind(this);
    }

    login() {
        if (!this.state.username || !this.state.password) {
            alert("Input username and password."); // STYLE improve
            return;
        }

        const password = sha.sha512(this.state.password);

        alert("logining in");
        fetch(`${config.host}/login`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: this.state.username,
                password: password,
            }),
        })
            .then(res => res.json())
            .then(res => {
                alert("response: " + JSON.stringify(res));
                if (res.token) {
                    AsyncStorage.setItem("token", res.token, err => {
                        if (err) {
                            alert("Unable to access device storage.");
                            return;
                        }
                        this.props.navigation.navigate("Home");
                    });
                } else {
                    alert("TODO"); //TODO Make error handling
                }
            })
            .catch(err => {
                alert(JSON.stringify(err));
            });
    }

    render() {
        return (
            <View style={styles.container}>

                {/*<Text style={{ color: "#242424", fontSize: 16 }}>Welcom to Iter, you new best sightseeing friend!</Text>*/}

                <Text style={{ fontSize: 22, color: "#242424", marginTop: "10%", height: d.height * 0.1 }}>Login or create account to continue.</Text>
                <View style={{ width: "100%", padding: "5%", height: d.height * 0.2}}>
                    <TextInput style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="Username" placeholderTextColor="#242424" onChangeText={username => this.setState({ username })}></TextInput>
                    <TextInput style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="Password" secureTextEntry placeholderTextColor="#242424" onChangeText={password => this.setState({ password })}></TextInput>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-evenly",}}>
                    <View style={{ flex: 10 }}></View>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", flexGrow: 0 }}>
                        <Button title={"Login"} onPress={this.login} color="#ad0a4c"></Button>
                        <Button title="Register" onPress={() => this.props.navigation.navigate("Register")} color="#ad0a4c"></Button>
                    </View>
                </View>
                
                <BetterImage cacheImage data={this.props.data} navigation={this.props.navigation} url={`${config.host}/banner.png`} imageSource="web" parentViewStyle={{ height: 200, width: "100%", position: "absolute", top : d.height * 0.9 - 200}} imageStyle={{ flex: 1 }}></BetterImage>
                <View style={{position: "absolute", height: d.height * 0.1, top: d.height * 0.9, width: "100%", backgroundColor: "#aaaaaa"}}></View>
            </View>
        );
    }
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100%",
    },
});

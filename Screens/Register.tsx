import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput, CheckBox, Dimensions } from "react-native";

import * as config from "../Config.json";
import { BetterImage } from "../Components/BetterImage";
import { Switch } from "react-native-gesture-handler";
//import { DataKeys } from "../Helper";
const sha = require("../sha");

interface Props extends IProps {

}

interface State {
    username?: string;
    password1?: string;
    password2?: string;
    passwordsMatch?: boolean;
    email?: string;
    licenseAccepted: boolean;
}

export class Register extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        //this.state = { passwordsMatch : true }

        this.register = this.register.bind(this);

        this.state = {
            licenseAccepted: false
        }
    }

    register() {
        alert(JSON.stringify(this.state));

        if (this.state.licenseAccepted && this.state.passwordsMatch && this.state.password1 && this.state.username && this.state.email) {
            const password = sha.sha512(this.state.password1);

            alert(`${config.host}/api/register`);
            fetch(`${config.host}/api/register`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: password,
                    email: this.state.email,
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
                    console.log(err);
                });
        }
    }

    confirmPasswordsMatch() {
        this.setState({ passwordsMatch: true });
    }

    render() {
        return (


            <View style={{
                flex: 1,
                backgroundColor: "white",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
            }}>

                {/*<Text style={{ color: "#242424", fontSize: 16 }}>Welcom to Iter, you new best sightseeing friend!</Text>*/}

                <Text style={{ fontSize: 22, color: "#242424", marginTop: "10%" }}>Login or create account to continue.</Text>
                <View style={{ width: "100%", padding: "5%",}}>
                    <TextInput autoCapitalize="none" style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholder="Username" placeholderTextColor="#242424" onChangeText={username => this.setState({ username })}></TextInput>
                    <TextInput
                        style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholderTextColor="#242424"
                        placeholder="Password"
                        onChangeText={password1 => {
                            this.setState({ password1 });
                            this.confirmPasswordsMatch();
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                    ></TextInput>
                    <TextInput
                        style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholderTextColor="#242424"
                        placeholder="Confirm Password"
                        onChangeText={password2 => {
                            this.setState({ password2 });
                            this.confirmPasswordsMatch();
                        }}
                        secureTextEntry
                        autoCapitalize="none"
                    ></TextInput>
                    <TextInput autoCapitalize="none" style={{ width: "100%", borderBottomColor: "#aaaaaa", borderBottomWidth: 2 }} placeholderTextColor="#242424" placeholder="E-mail" onChangeText={email => this.setState({ email })}></TextInput>
                    <View style={{width: "100%", flexDirection: "row", justifyContent: "flex-start", alignItems: "center"}}>
                    <Text>I accept license aggreement:</Text>
                    <Switch style={{margin: "5%"}} thumbColor="#aaaaaa" trackColor={{false: "#242424", true: "#ad0a4c"}} onValueChange={licenseAccepted => this.setState({licenseAccepted})} value={this.state.licenseAccepted}></Switch>
                </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-evenly", width: "100%", alignContent: "center", alignItems: "center" }}>
                    <Button title="Create account" onPress={this.register} color="#ad0a4c"></Button>
                    <Text style={{ color: "#242424" }}></Text>
                    <Button title="Back to login" onPress={() => this.props.navigation.navigate("Login")} color="#ad0a4c">
                    </Button>
                </View>
                <View style={{ flex: 1 }}></View>
                <BetterImage cacheImage data={this.props.data} navigation={this.props.navigation} url={`${config.host}/banner2.png`} imageSource="web" parentViewStyle={{ height: 200, width: "100%", position: "absolute", top : d.height * 0.9 - 200}} imageStyle={{ flex: 1 }}></BetterImage>
                
            </View>
        );
    }
}

const d = Dimensions.get("screen");

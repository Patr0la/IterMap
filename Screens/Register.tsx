import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput, CheckBox } from "react-native";

import * as config from "../Config.json";
//import { DataKeys } from "../Helper";
const sha = require("../sha");

interface Props {
    navigate: (screen: string) => void;
}

interface State {
    username: string;
    password1: string;
    password2: string;
    passwordsMatch: boolean;
    email: string;
    licenseAccepted: boolean;
}

export class Register extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        //this.state = { passwordsMatch : true }

        this.register = this.register.bind(this);
    }

    register() {
        alert(JSON.stringify(this.state));

        if (this.state.licenseAccepted && this.state.passwordsMatch && this.state.password1 && this.state.username && this.state.email) {
            const password = sha.sha512(this.state.password1);

            alert(`http://${config.host}/register`);
            fetch(`http://${config.host}/register`, {
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

                            this.props.navigate("Home");
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
            <View>
                <Text>Username:</Text>
                <TextInput placeholder="Username" onChangeText={username => this.setState({ username })}></TextInput>
                <TextInput
                    placeholder="Password"
                    onChangeText={password1 => {
                        this.setState({ password1 });
                        this.confirmPasswordsMatch();
                    }}
                ></TextInput>
                <TextInput
                    placeholder="Confirm Password"
                    onChangeText={password2 => {
                        this.setState({ password2 });
                        this.confirmPasswordsMatch();
                    }}
                ></TextInput>
                <TextInput placeholder="E-mail" onChangeText={email => this.setState({ email })}></TextInput>
                <Text>I accept license aggreement:</Text>
                <CheckBox onValueChange={licenseAccepted => this.setState({ licenseAccepted })}></CheckBox>
                <Button title="Login" onPress={this.register}>
                    <Text>Register</Text>
                </Button>
                <Button title="Register" onPress={() => this.props.navigate("Register")}>
                    <Text>Back to login.</Text>
                </Button>
            </View>
        );
    }
}

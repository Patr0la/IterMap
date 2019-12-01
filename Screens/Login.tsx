import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput } from "react-native";

import * as config from "../Config.json";

const sha = require("../sha");

interface Props {
    navigate: (screen: string) => void;
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
        fetch(`http://${config.host}/login`, {
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
                        this.props.navigate("Home");
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
                <Text>Username:</Text>
                <TextInput placeholder="Username" onChangeText={username => this.setState({ username })}></TextInput>
                <TextInput placeholder="Password" onChangeText={password => this.setState({ password })}></TextInput>
                <Button title="Login" onPress={this.login}>
                    <Text>Login</Text>
                </Button>
                <Button title="Register" onPress={() => this.props.navigate("Register")}>
                    <Text>New to IterMap? Register.</Text>
                </Button>
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

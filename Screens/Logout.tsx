import React from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput } from "react-native";

interface Props {
    navigate: (screen: string) => void;
}

interface State {}

export class Logout extends React.Component<Props, State> {
    render() {
        return (
            <View style={styles.container}>
                <Text>Are you sure you want to log out?</Text>
                <Button
                    title="logout"
                    onPress={() => {
                        AsyncStorage.clear((err) => {
                            if(err) alert("Unknown error");

                            this.props.navigate("Login"); // TODO destroy token on server
                        });
                    }}
                >
                    <Text>Continue</Text>
                </Button>
                <Button title="back" onPress={() => this.props.navigate("Home")}>
                    <Text>Cancle</Text>
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

import React from "react";
import { Text, Button, View, Image, StyleSheet, AsyncStorage, TextInput, Picker, PickerItem } from "react-native";

import * as config from "../Config.json";

interface State {
    title: string;
}

export class CreateNewRoute extends React.Component<IProps, State> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            title: "",
        };

        this.next = this.next.bind(this);
    }

    next() {
        alert("HEre=");
        AsyncStorage.getItem("token", (err, token) => {
            if (token) {
                alert("Here====");
                fetch(`http://${config.host}/newRoute`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Cookie: `session=${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: this.state.title,
                    }),
                })
                    .then(res => res.json())
                    .then(res => {
                        this.props.navigation.navigate("EditRoute", {id: res.id});
                    });
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Title</Text>
                <TextInput onChangeText={title => this.setState({ title })} placeholder="Epic Title." style={styles.textInput}></TextInput>
                {/* <Text>Route Type: {this.state.type}</Text>
                <Picker
                    mode="dropdown"
                    selectedValue={this.state.type}
                    style={styles.picker}
                    onValueChange={(type, index) => {
                        this.setState({ type });
                    }}
                >
                    <Picker.Item label="City" value="City" />
                    <Picker.Item label="Country" value="Country" />
                    <Picker.Item label="International" value="International" />
                </Picker>*/}

                <Button title="Chose Picture" onPress={() => false}>
                    <Text>Chose Picture</Text>
                </Button>

                <Button title="Next" onPress={this.next}>
                    Next
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
    textInput: {
        width: "100%",
    },
    picker: {
        height: 50,
        width: 50,
    },
});

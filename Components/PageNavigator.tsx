import React, { ReactNode } from "react";
import { Text, Button, View, Image, StyleSheet, PermissionsAndroid, Dimensions, TouchableOpacity, TextInput } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Search } from "../Components/Search";
import { RoutesPreview } from "../Components/RoutesPreview";

interface Props {
    routes: Array<{
        title: string | JSX.Element;
        value: string;
    }>;

    default:string;

    onSelectionChange: (newSelection: any) => void;
}

type State = {
    viewing: string;
};

export class PageNavigator extends React.Component<Props, State> {
    static navigationOptions = {
        drawerLabel: "Home",
        //drawerIcon: ({ tintColor }) => <Image style={[styles.icon, { tintColor: tintColor }]} />,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            viewing: props.default
        }
    }

    Searchbar: Search;
    render() {
        let width = d.width / this.props.routes.length;
        return (
            <View>
                <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                    {this.props.routes.map(r => (
                        <TouchableOpacity
                            style={{ ...styles.button, width, ...(this.state.viewing == r.value ? { borderBottomColor: "#ad0a4c", borderBottomWidth: 4 } : {}) }}
                            onPress={() => {
                                this.setState({ viewing: r.value }, () => {
                                    this.props.onSelectionChange(r.value);
                                });
                            }}
                            key={r.value}
                        >
                            {typeof(r.title) == "string" ?  <Text style={styles.buttonText}>{r.title}</Text> : r.title}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#242424",
        color: "white",
        justifyContent: "center",
        borderBottomWidth: 4,
        borderBottomColor: "#242424",
    },
    buttonText: {
        fontSize: 16,
        lineHeight: 16,
        height: 44,
        color: "white",
        textAlignVertical: "center",
        textAlign: "center",
        alignSelf: "center",
        fontWeight: "bold",
    },
});

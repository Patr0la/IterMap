import React from "react";
import { View, Picker, Text } from "react-native";
import { TextInput, ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props extends IProps {
    values: Array<{
        search: string;
        value: string;
        display: string;
    }>


    decider: (
        values: Array<{
            search: string;
            value: string;
            display: any;
        }>, text) => Array<{
            search: string;
            value: string;
            display: string;
        }>

    onSelect: (value: string) => void;
}

interface State {
    text: string;

    value: string;
}

export class SearchablePicker extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            text: "",
            value: ""
        }
    }

    render() {
        return (
            <View style={{ width: "100%", height: "100%", backgroundColor: "white", borderRadius: 10 }}>
                <TextInput
                    placeholder="Search place types..."
                    placeholderTextColor="#aaaaaa"
                    style={{ width: "100%", paddingRight: "5%", paddingLeft: "5%", borderBottomColor: "#ad0a4c", borderBottomWidth: 2}} onChangeText={(text) => {
                        this.setState({ text })
                    }}></TextInput>

                <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{marginTop: "5%"}}>
                    {this.props.decider(this.props.values, this.state.text).map(({ display, value, search }) =>
                        <TouchableOpacity onPress={() => {
                            this.setState({ value });
                            this.props.onSelect(value)
                        }} style={{ flexDirection: "row", width: "100%", paddingLeft: "5%", paddingRight: "5%", marginBottom: "2%", alignItems: "center" }}>
                            <Icon name={display} size={26} color="#242424" />
                            <Text style={{ marginLeft: "4%", fontSize: 16 }}>{search}</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
        );
    }
}
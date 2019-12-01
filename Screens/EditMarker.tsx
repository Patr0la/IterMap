import React, { Component } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { BetterImage } from "../Components/BetterImage";

import ImagePicker from "react-native-image-picker"
import RNFetchBlob from "rn-fetch-blob";

import * as config from "../Config.json";

interface Props extends IProps {
    
}

interface State extends IMarker {
    routeId: string;

    mainPicSource: string;
    mainPicStartLocation: { x: number; y: number };
    mainPicRadius: number;
    pictureSources: Array<string>;
}

export class EditMarker extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    componentDidMount(){
        let data : IMarker = this.props.navigation.getParam("data", {});
        this.setState({...data });
    }

    render() {
        let mainPic = this.state?.pictures?.[0] ?? this.state?.mainPicSource;

        return (
            <View>
                <TextInput style={styles.textInput} value={this.state?.title} onChangeText={title => this.setState({ title })}></TextInput>
                
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    <TextInput style={{...styles.textInput, width: "35%"}} value={this.state?.time} placeholder="Time" onChangeText={time => this.setState({ time })}></TextInput>
                    <TextInput style={{...styles.textInput, width: "35%"}} value={this.state?.price?.value?.toString()} placeholder="Price" onChangeText={cost => this.setState({ price: {value: parseInt(cost), currency: "€"} })}></TextInput>
                </View>
                {
                    mainPic ? 
                    <BetterImage
                        url={`http://${config.host}/routeImages?route=${this.state.routeId}&image=${mainPic}`} imageSource="web" cacheImage={false}
                        imageStyle={{width: "100%", height: "100%", borderRadius: 32}}
                        parentViewStyle={{width: 64, height: 64, marginTop: 10, marginLeft: 20 }}
                        data={this.props.data}
                        navigation={this.props.navigation}>
                    </BetterImage> :
                    <View onTouchEnd={() => {
                        ImagePicker.showImagePicker({
                            title: "Select image visible on map",
                            storageOptions: {
                                skipBackup: true,
                                path: "images"
                            },
                            mediaType: "photo",
                        }, (res) => {
                            if(!res.didCancel && !res.error && !res.customButton) {
                                this.setState({mainPicSource: res.uri}); // TODO image check, mini width etc..

                                fetch(`http://${config.host}/uploadMarkerPicture`, {
                                    method: "POST",
                                    headers: {
                                        Accept: "application/json",
                                        "Content-Type": "application/json",
                                        Cookie: `session=${this.props.data.token}`,
                                    },
                                    body: JSON.stringify({
                                        image: res.data,
                                        routeId: this.state.routeId,
                                    }),
                                })
                                    .then(res => res.json())
                                    .then(res => {
                                        console.log(res);

                                        this.setState({pictures: [res.id, ...this.state.pictures.slice(1)]});
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    });
                                
                                
                            }
                        });
                    }} style={styles.addMainImage}>
                        <Icon style={{flexGrow:1}} name="image-plus" size={48}/>
                        <Text style={{color:"white"}}>Select main picture</Text>
                    </View>
                }
                
                <TextInput style={{...styles.textInput, height: 100}} multiline value={this.state?.description} placeholder="Description..." onChangeText={description => this.setState({ description })}></TextInput>

                <Icon onPress={() => {
                    this.props.navigation.getParam("callback", () => {})(this.state);
                    this.props.navigation.goBack();
                }} name="check" size={30} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    textInput: {
        borderColor: "#aaaaaa",
        borderWidth: 2,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 10,
    },
    addMainImage: {
        height: 128, 
        width: 128,
        justifyContent: "center",
        flexDirection: "column",
    },
});

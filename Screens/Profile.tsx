import React from 'react';
import {Text, Image, View, StyleSheet, RefreshControl, Dimensions} from 'react-native';
import {RoutesPreview} from '../Components/RoutesPreview';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';

import * as config from '../Config.json';
import {Search} from '../Components/Search';

interface State extends IProfileEntry {
    routesData?: Array<IRoute>;

    refreshing?: boolean;

    viewing: 'routes' | 'about';
}

export class Profile extends React.Component<IProps, State> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            viewing: 'routes',
        };
    }

    loadData() {
        fetch(this.loadedUsername == this.props.data.username ? `http://${config.host}/myProfileInfo` : `http://${config.host}/userProfileInfo?username=${this.loadedUsername}`, {
            headers: {
                Accept: 'application/json',
                Cookie: `session=${this.props.data.token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(profileInfo => {
                this.setState({...profileInfo, refreshing: false});
            })
            .catch(reason => {
                this.setState({refreshing: false});
                console.log(reason);
            });

        fetch(this.loadedUsername == this.props.data.username ? `http://${config.host}/getMyRoutes` : `http://${config.host}/getUserRoutes?username=${this.loadedUsername}`, {
            headers: {
                Accept: 'application/json',
                Cookie: `session=${this.props.data.token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(res => res.json())
            .then(routesData => {
                this.setState({routesData, refreshing: false});
            })
            .catch(reason => {
                this.setState({refreshing: false});
                console.log(reason);
            });
    }

    loadedUsername: string;
    Searchbar;
    render() {
        let username = this.props.navigation.getParam('username', this.props.data.username);
        if (username != this.loadedUsername) {
            this.loadedUsername = username;
            this.loadData();
        }

        return (
            <View>
                <Search
                    placeHolder="Search for routes"
                    ref={ref => (this.Searchbar = ref)}
                    endpoint="findRoutes"
                    menu
                    navigation={this.props.navigation}
                    data={this.props.data}
                    onSelectCallback={selection => {
                        console.log(selection); // TODO Navigate to thism
                    }}
                />
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <TouchableOpacity style={{...styles.button, ...(this.state.viewing == 'about' ? {borderBottomColor: '#ad0a4c', borderBottomWidth: 4} : {})}} onPress={() => this.setState({viewing: 'about'})}>
                        <Text style={styles.buttonText}>Nearby</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{...styles.button, ...(this.state.viewing == 'routes' ? {borderBottomColor: '#ad0a4c', borderBottomWidth: 4} : {})}} onPress={() => this.setState({viewing: 'routes'})}>
                        <Text style={styles.buttonText}>{this.props.data.lastLocation.country}</Text>
                    </TouchableOpacity>
                </View>

                <View>{this.state.routesData && <RoutesPreview routeData={this.state.routesData} navigation={this.props.navigation} data={this.props.data}></RoutesPreview>}</View>
            </View>
        );
    }
}

const d = Dimensions.get('screen');

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#242424',
        color: 'white',
        justifyContent: 'center',
        borderBottomWidth: 4,
    },
    buttonText: {
        width: d.width / 2,
        fontSize: 16,
        lineHeight: 16,
        height: 44,
        color: 'white',
        textAlignVertical: 'center',
        textAlign: 'center',
        fontWeight: 'bold',
    },

    container: {
        flex: 1,
        backgroundColor: '#fff',
        //alignItems: "center",
        //justifyContent: "center",
        height: '100%',
    },
    textInput: {
        width: '100%',
    },
    picker: {
        height: 50,
        width: 50,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

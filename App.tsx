import React from "react";
import { StyleSheet, Text, View, Image, ScrollView, Easing, Animated, StatusBar } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";
import { Profile } from "./Screens/Profile";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { Home } from "./Screens/Home";
import { Login } from "./Screens/Login";
import { Register } from "./Screens/Register";
import { LoadingScreen } from "./Screens/LoadingScreen";
import { Logout } from "./Screens/Logout";
import { Settings } from "./Screens/Settings";
import { CreateNewRoute } from "./Screens/CreateNewRoute";
import { EditRoute } from "./Screens/EditRoute";
import { UserData } from "./UserData";
import { EditMarker } from "./Screens/EditMarker";
import { LiveRouteManage } from "./Screens/LiveRouteManage";
import { LiveRoute } from "./Screens/LiveRoute";
import { SideMenu } from "./Components/SideMenu";
import { Camera } from "./Screens/Camera";
import { ImageTaken } from "./Screens/ImageTaken";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native-gesture-handler";

/*
    let uri = { uri: "https://www.rspcasa.org.au/wp-content/uploads/2019/01/Adopt-a-cat-or-kitten-from-RSPCA.jpg" };
    return <Stack/>;

    /*
      <ScrollView style={styles.container}>
        <Text>Image: </Text>
        <Image source={uri} style= {{ height: 600 }}/>
        <Text>Ovo će biti naporno, jako naporno.....</Text>

        
      </ScrollView>*/

var userData = new UserData();

//#region Auth Stack Navigator
const LoginScreen = props => {
    return <Login navigate={props.navigation.navigate}></Login>;
};

const RegisterScreen = props => {
    return <Register navigate={props.navigation.navigate}></Register>;
};

const AuthStack = createStackNavigator({
    Login: {
        screen: LoginScreen,
        navigationOptions: ({ navigation }) => ({
            title: "Login",
        }),
    },
    Register: RegisterScreen,
});

//#endregion

//#region App Drawer Navigator
const HomeScreen = props => {
    return <Home data={userData} navigation={props.navigation}></Home>;
};

const ProfileScreen = props => {
    return <Profile data={userData} navigation={props.navigation}></Profile>;
};

const LoadingScreenScreen = props => {
    return <LoadingScreen data={userData} navigation={props.navigation}></LoadingScreen>;
};

const LogoutScreen = props => {
    return <Logout navigate={props.navigation.navigate}></Logout>;
};

const SettingsScreen = props => {
    return <Settings navigate={props.navigation.navigate}></Settings>;
};

const CameraScreen = props => {
    return <Camera data={userData} navigation={props.navigation}></Camera>;
};

const ImageTakenScreen = props => {
    return <ImageTaken data={userData} navigation={props.navigation}></ImageTaken>;
};

const CameraStack = createStackNavigator({
    Camera: {
        screen: CameraScreen,
        navigationOptions: () => ({
            header: null,
        }),
    },
    ImageTaken: {
        screen: ImageTakenScreen,
        navigationOptions: () => ({
            header: null,
        }),
    },
});

//#region RuteCreation Stack Navigator

var openRouteEditor: (id: string) => void;

const EditRouteScreen = props => {
    return <EditRoute ref={ref => (openRouteEditor = ref ? ref.LoadRoute : undefined)} data={userData} navigation={props.navigation}></EditRoute>;
};

const CreateNewRouteScreen = props => {
    return <CreateNewRoute data={userData} navigation={props.navigation}></CreateNewRoute>;
};

const MarkerEditScreen = props => {
    return <EditMarker data={userData} navigation={props.navigation}></EditMarker>;
};

const RouteCreationStack = createStackNavigator({
    CreateNewRoute: {
        screen: CreateNewRouteScreen,
    },
    EditRoute: {
        screen: EditRouteScreen,
        navigationOptions: () => ({
            header: null,
        }),
    },
});

const ProfileStack = createStackNavigator({
    Profile: {
        screen: ProfileScreen,
        navigationOptions: () => ({
            header: null,
        }),
    },
    EditRoute: {
        screen: EditRouteScreen,
        navigationOptions: () => ({
            header: null,
            drawerLockMode: "locked-closed",
        }),
    },
    MarkerEditScreen: {
        screen: MarkerEditScreen,
        navigationOptions: () => ({
            title: "Edit marker",
            drawerLockMode: "locked-closed",
        }),
    },
});
//#endregion

//#region LiveRouteStack

const CreateLiveRouteScreen = props => {
    return <LiveRouteManage data={userData} navigation={props.navigation}></LiveRouteManage>;
};

const LiveRouteScreen = props => {
    return <LiveRoute navigatedTo data={userData} navigation={props.navigation}></LiveRoute>;
};
const LiveRouteStack = createStackNavigator({
    CreateLiveRoute: {
        screen: CreateLiveRouteScreen,
        navigationOptions: ({navigation}) => ({
            headerTitle: props => (
                <View style={{ backgroundColor: "#242424", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", height: "100%", paddingLeft: "5%" }}>
                    <TouchableOpacity onPress={
                        () => navigation.goBack(null)
                    }>
                        <Icon name="arrow-left" size={26} color="white" />
                    </TouchableOpacity>
                    <Text style={{ color: "white", fontSize: 24, marginLeft: "5%" }}>Manage live routes</Text>
                </View>
            ),
            drawerLockMode: "locked-closed",
        }),
    },
    LiveRoute: {
        screen: LiveRouteScreen,
        navigationOptions: ({navigation}) => ({
            headerTitle: props => (
                <View style={{ backgroundColor: "#242424", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", width: "100%", height: "100%", paddingLeft: "5%" }}>
                    <Text style={{ color: "white", fontSize: 24, marginLeft: "5%" }}>{navigation.getParam("routeName", "?")} </Text>
                </View>
            ),
            drawerLockMode: "locked-closed",
            headerLeftContainerStyle: {backgroundColor: "#242424", color: "white"},
            headerTintColor: "white",
            headerTitleStyle: {color: "white"},
            headerBackTitleStyle: {color: "white"}
        }),
    },
});

//#endregion

const SideMenuComponent = props => {
    return <SideMenu data={userData} navigation={props.navigation}></SideMenu>;
};

const Drawer = createDrawerNavigator(
    {
        Home: {
            screen: HomeScreen,
            path: "people/:name",
            navigationOptions: options => ({
                title: `Home`,
                drawerLockMode: options.navigation.state.params?.drawerLockMode ?? "unlocked",
                //navigate: options.navigation
            }),
        },
        Profile: {
            screen: ProfileStack,
            path: "people/:name",
            navigationOptions: ({ navigation }) => ({
                title: `Profile`,
                //naviagte: navigation.navigate,
            }),
        },
        Settings: {
            screen: SettingsScreen,
            navigationOptions: () => ({
                title: "Settings",
                drawerLabel: null,
            }),
        },
        Logout: {
            screen: LogoutScreen,
            navigationOptions: () => ({
                title: "Logout",
                drawerLabel: null,
            }),
        },
        RouteCreation: {
            screen: RouteCreationStack,
            navigationOptions: () => ({
                title: "New Route",
                drawerLockMode: "locked-closed",
            }),
        },
        LiveRouteCreation: {
            screen: LiveRouteStack,
            navigationOptions: () => ({
                title: "LiveRoutes",
                drawerLockMode: "locked-closed",
            }),
        },
        Camera: {
            screen: CameraStack,
            
        },

        // TODO: Create more pages
    },
    {
        initialRouteName: "Home",
        unmountInactiveRoutes: true,
        defaultNavigationOptions: {
            title: "IterrMap",
        },
        contentComponent: SideMenuComponent,
        // transitionConfig: () => ({
        //     transitionSpec: {
        //         duration: 300,
        //         easing: Easing.out(Easing.poly(4)),
        //         timing: Animated.timing,
        //     },
        //     screenInterpolator: sceneProps => {
        //         const { layout, position, scene } = sceneProps;
        //         const { index } = scene;

        //         const width = layout.initWidth;

        //         const translateX = position.interpolate({
        //             inputRange: [index - 1, index, index + 1],
        //             outputRange: [0, 0, width],
        //         });

        //         const opacity = position.interpolate({
        //             inputRange: [index - 1, index - 0.99, index],
        //             outputRange: [0, 1, 1],
        //         });

        //         return { opacity, transform: [{ translateX }] };
        //     },
        // }),
    }
);

Drawer
//#endregion

//#region Switch Navigator
const Switch = createSwitchNavigator({
    Loading: LoadingScreenScreen,
    App: Drawer,
    Auth: AuthStack,
});

const App = createAppContainer(Switch);
export default App;

//#endregion

StatusBar.setBackgroundColor("#222222", true);

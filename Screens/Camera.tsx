import React from "react";

import { View, Button, TextInput, StyleSheet, Text, Dimensions, StatusBarIOS, StatusBar, Animated, Platform, NativeEventEmitter } from "react-native";
import { TouchableOpacity, PinchGestureHandler, State } from "react-native-gesture-handler";

import { RNCamera, Point } from "react-native-camera";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import * as config from "../Config.json";
import { Search } from "../Components/Search";

import { accelerometer, SensorTypes, setUpdateIntervalForType } from "react-native-sensors";

import RNDeviceRotation from "react-native-device-rotation";
interface Props extends IProps {}

interface IState {
    flash: boolean;
    front: boolean;

    focusPos: Point<number>;
    background: Animated.Value;

    zoom: number;

    angle: number;
    displayingAngle: boolean;
    angleHidden: boolean;

    grid: boolean;

    nearZero: boolean;
}

const ZOOM_MIN = Platform.OS == "ios" ? 0.007 : 0.008;

export class Camera extends React.Component<Props, IState> {
    constructor(props: Props) {
        super(props);

        this.state = {
            flash: props.data.flash,
            front: props.data.cameraFront,
            focusPos: { x: 0.5, y: 0.5 },

            background: new Animated.Value(0),

            zoom: 0,

            angle: 0,
            displayingAngle: props.data.displayAngle,
            angleHidden: false,

            nearZero: false,

            grid: props.data.grid,
        };

        this.fade = new Animated.Value(1);

        this.accelerometer = accelerometer.subscribe(
            ({ x, y, z, timestamp }) => {
                if (Math.abs(z) > 8 && !this.state.angleHidden) {
                    this.setState({ angleHidden: true });
                    return;
                } else if (Math.abs(z) < 7 && this.state.angleHidden) {
                    this.setState({ angleHidden: false });
                    return;
                }

                let deg = (x * 90) / 9.81;
                if (Math.abs(deg) < 3 && !this.state.nearZero) {
                    this.setState({ nearZero: true });
                    this.angleView?.setNativeProps({ transform: [{ rotate: `${0}deg` }] });
                } else if (Math.abs(deg) > 87 && !this.state.nearZero) {
                    this.setState({ nearZero: true });
                    this.angleView?.setNativeProps({ transform: [{ rotate: `${90}deg` }] });
                } else if (Math.abs(deg) > 3 && Math.abs(deg) < 87) {
                    if (this.state.nearZero) this.setState({ nearZero: false });
                    this.angleView?.setNativeProps({ transform: [{ rotate: `${deg}deg` }] });
                }
            },
            err => console.log(err),
            () => console.log("Done")
        );

        setUpdateIntervalForType(SensorTypes.accelerometer, 50);
    }

    accelerometer;

    rotation;
    componentWillUnmount() {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor("#242424");

        this.accelerometer.unsubscribe();
        this.accelerometer.remove();
    }

    camera: RNCamera;
    fade: Animated.Value;

    onZoomStart() {
        this.prevScale = 1;
    }

    onZoomChange(s: number) {
        let s2 = s - this.prevScale;
        if (s2 > 0 && s2 > ZOOM_MIN) this.setState({ zoom: Math.min(this.state.zoom + ZOOM_MIN, 1) });
        else if (s2 < 0 && s2 < -ZOOM_MIN) this.setState({ zoom: Math.max(this.state.zoom - ZOOM_MIN, 0) });
        this.prevScale = s;
    }

    onZoomEnd() {
        this.prevScale = 1;
    }

    prevScale: number;
    angleView: View;

    render() {
        let color = this.state.background.interpolate({
            inputRange: [0, 100],
            outputRange: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 255)"],
        });

        if (this.props.navigation.isFocused) {
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor("#24242411");

            return (
                <Animated.View>
                    <RNCamera
                        ref={ref => {
                            this.camera = ref;
                        }}
                        style={styles.preview}
                        type={this.state.front ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back}
                        autoFocus={RNCamera.Constants.AutoFocus.on}
                        flashMode={this.state.flash ? RNCamera.Constants.FlashMode.on : RNCamera.Constants.FlashMode.off}
                        androidCameraPermissionOptions={{
                            title: "Permission to use camera",
                            message: "Iter needs your permission for in app camera to work.",
                            buttonPositive: "Ok",
                            buttonNegative: "Cancle",
                        }}
                        zoom={this.state.zoom}
                        autoFocusPointOfInterest={this.state.focusPos}
                    >
                        <PinchGestureHandler
                            onGestureEvent={({ nativeEvent: { scale } }) => {
                                this.onZoomChange(scale);
                            }}
                            onHandlerStateChange={({ nativeEvent: { state } }) => {
                                if (state == State.END) this.onZoomEnd();
                                else if (state == State.BEGAN) this.onZoomStart();
                            }}
                        >
                            <Animated.View
                                onResponderEnd={() => {}}
                                style={{
                                    ...styles.preview,
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    backgroundColor: color,
                                    paddingTop: StatusBar.currentHeight,
                                }}
                            >
                                <View style={{ flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-end", marginRight: "5%" }}>
                                    {/*<View
                                        style={{
                                            flexDirection: "row",
                                            backgroundColor: "#24242422",
                                            borderRadius: 25,
                                            width: "50%",
                                            alignSelf: "center",
                                            alignContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <TouchableOpacity>
                                            <Icon name="magnify" color="#aaaaaa" size={32} style={{ marginLeft: "5%" }} />
                                        </TouchableOpacity>
                                        <TextInput placeholder="Search routes.." placeholderTextColor="#aaaaaa"></TextInput>
                                    </View>*/}

                                    <TouchableOpacity
                                        style={{ marginTop: "5%" }}
                                        onPress={() => {
                                            this.props.data.cameraFront = !this.state.front;
                                            this.setState({ front: !this.state.front });
                                        }}
                                    >
                                        <Icon name="sync" color="white" size={32} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ marginTop: "5%" }}
                                        onPress={() => {
                                            this.props.data.flash = !this.state.flash;
                                            this.setState({ flash: !this.state.flash });
                                        }}
                                    >
                                        {this.state.flash ? <Icon name="flash" color="white" size={32} /> : <Icon name="flash-off" color="white" size={32} />}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ marginTop: "5%" }}
                                        onPress={() => {
                                            this.props.data.grid = !this.state.grid;
                                            this.setState({ grid: !this.state.grid });
                                        }}
                                    >
                                        {this.state.grid ? <Icon name="grid" color="white" size={32} /> : <Icon name="grid-off" color="white" size={32} />}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ marginTop: "5%" }}
                                        onPress={() => {
                                            this.props.data.displayAngle = !this.state.displayingAngle;
                                            this.setState({ displayingAngle: !this.state.displayingAngle });
                                        }}
                                    >
                                        {this.state.displayingAngle ? <Icon name="angle-right" color="white" size={32} /> : <Icon name="angle-obtuse" color="white" size={32} />}
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPressIn={() => this.startTakingPicture()} style={{ alignSelf: "center" }}>
                                    <Icon name="camera-iris" size={100} color="white" />
                                </TouchableOpacity>
                            </Animated.View>
                        </PinchGestureHandler>

                        {this.state.displayingAngle && !this.state.angleHidden && (
                            <View ref={ref => (this.angleView = ref)} style={{ position: "absolute", top: d.height / 2 - 5, left: (d.width / 7) * 2, flexDirection: "row" }}>
                                <View style={{ height: 2, width: d.width / 7, backgroundColor: this.state.nearZero ? "#ad0a4c" : "#242424" }}></View>
                                <View style={{ height: 2, width: d.width / 7, backgroundColor: this.state.nearZero ? "#ad0a4c" : "#242424", marginLeft: d.width / 7 }}></View>
                            </View>
                        )}

                        {this.state.grid && <View style={{ position: "absolute", width: 1, height: d.height, top: 0, left: d.width / 3, backgroundColor: "#aaaaaa6f" }} />}
                        {this.state.grid && <View style={{ position: "absolute", width: 1, height: d.height, top: 0, left: (d.width / 3) * 2, backgroundColor: "#aaaaaa6f" }} />}

                        {this.state.grid && <View style={{ position: "absolute", width: d.width, height: 1, top: d.height / 3, left: 0, backgroundColor: "#aaaaaa6f" }} />}
                        {this.state.grid && <View style={{ position: "absolute", width: d.width, height: 1, top: (d.height / 3) * 2, left: 0, backgroundColor: "#aaaaaa6f" }} />}
                    </RNCamera>
                </Animated.View>
            );
        }

        this.camera.componentWillUnmount();
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor("#242424");
        return <View></View>;
    }

    async startTakingPicture() {
        let _this = this;

        this.setState({ background: new Animated.Value(0) }, () => {
            Animated.timing(this.state.background, {
                toValue: 100,
                duration: 250,
            }).start(() => {
                this.state.background.setValue(0);
            });
        });
        let x = await this.camera.takePictureAsync({ quality: 0.7, base64: true, pauseAfterCapture: true, doNotSave: true });

        this.camera.resumePreview();
        this.props.navigation.navigate("ImageTaken", { imageData: x.base64, location: {lat: this.props.data.lastLocation.pos.latitude, lng: this.props.data.lastLocation.pos.longitude} });
    }
}

const d = Dimensions.get("screen");
const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
    },
    preview: {
        height: d.height,
        width: d.width,
    },
});

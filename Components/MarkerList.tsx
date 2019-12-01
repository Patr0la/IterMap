import React from "react";
import { Platform, Dimensions, StyleSheet, ScrollView, View} from "react-native";
import { Marker } from "./Marker";
import { EditMap } from "./EditMap";

interface Props extends IProps {
    Map:EditMap;
    markers: Array<IMarker>
    routeId: string;

    onMarkerUpdate: (markers: Array<IMarker>) => void;
}

interface State {
    markers: Array<IMarker>

    scrollViewOffset: number;
}

export class MarkerList extends React.Component<Props, State> {
    scrollView:ScrollView;

    constructor(props: Props){
        super(props);

        this.state = {
            markers: props.markers,

            scrollViewOffset: 0,
        }
    }

    componentWillUpdate(){
        this.markers.forEach(m => m && m.setState({markers: this.state.markers}));
    }

    markers: Array<Marker> = [];
    render(){
        if(!this.state.markers) return null;
        
        return(
            <ScrollView onScroll={e => this.setState({ scrollViewOffset: e.nativeEvent.contentOffset.y })} ref={ref => this.scrollView = ref} onMoveShouldSetResponder={() => true} onStartShouldSetResponder={() => true} onStartShouldSetResponderCapture={() => false} onMoveShouldSetResponderCapture={() => false}>
            <View style={{height: this.markers.length * 80, width: "100%"}}>
            {this.state.markers.map((m, i) => <Marker ref={ref => this.markers[i] = ref} scrollFor={(n) => {
                this.scrollView?.scrollTo({y: this.state.scrollViewOffset + n, x: 0, animated: true});
            }} routeId={this.props.routeId} onMarkerUpdate={(markers) => {this.props.onMarkerUpdate(markers)}} i={i} markerElements={this.markers} markers={this.state.markers} map={this.props.Map} data={this.props.data} navigation={this.props.navigation}></Marker>)}
            </View>    
            </ScrollView>
        );
    }
}

const d = Dimensions.get("screen");

const styles = StyleSheet.create({
    marker: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        borderColor: "gray",
        borderWidth: 2,

        position: "absolute",
        width: "100%",

        backgroundColor: "#fff",
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        height: 60,
        flex: 1,
        marginTop: 7,
        marginBottom: 12,
        borderRadius: 4,

        ...Platform.select({
            ios: {
                width: d.width - 30 * 2,
                shadowColor: "rgba(0,0,0,0.2)",
                shadowOpacity: 1,
                shadowOffset: { height: 2, width: 2 },
                shadowRadius: 2,
            },

            android: {
                width: d.width - 30 * 2,
                elevation: 0,
                marginHorizontal: 30,
            },
        }),
    },
});

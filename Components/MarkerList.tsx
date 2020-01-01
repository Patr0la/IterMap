import React from "react";
import { Platform, Dimensions, StyleSheet, ScrollView, View, Text } from "react-native";
import { Marker } from "./Marker";
import { EditMap } from "./EditMap";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native-gesture-handler";

interface Props extends IProps {
	Map: EditMap;
	markers: Array<IMarker>;
	routeId: string;

	onMarkerUpdate: (markers: Array<IMarker>) => void;

	fullscreenChange: (fullscreen: boolean) => void;
}

interface State {
	markers: Array<IMarker>;

	scrollViewOffset: number;

	scrollViewOffsetForFlying: number;

	fullscreen: boolean;
}

export class MarkerList extends React.Component<Props, State> {
	scrollView: ScrollView;

	constructor(props: Props) {
		super(props);

		this.state = {
			markers: props.markers,

			scrollViewOffset: 0,

			scrollViewOffsetForFlying: 0,

			fullscreen: false,
		};
	}

	componentWillUpdate() {
		this.props.markers != this.state.markers && this.setState({ markers: this.props.markers });
		// this.markers.forEach((m) => m && m.setState({ markers: this.state.markers }));
	}

	markers: Array<Marker> = [];

	flying: View;
	render() {
		if (!this.props.markers) return null;

		return (
			<ScrollView
				onScroll={(e) => {
					this.setState({ scrollViewOffset: e.nativeEvent.contentOffset.y });
					this.flying.setNativeProps({ style: { position: "absolute", top: e.nativeEvent.contentOffset.y + 10, width: "30%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", zIndex: 4, alignSelf: "center" } });
				}}
				onMomentumScrollEnd={(e) => {
					//this.setState({ scrollViewOffsetForFlying: e.nativeEvent.contentOffset.y });
					// this.flying
				}}
				ref={(ref) => (this.scrollView = ref)}
				onMoveShouldSetResponder={() => true}
				onStartShouldSetResponder={() => true}
				onStartShouldSetResponderCapture={() => false}
				onMoveShouldSetResponderCapture={() => false}
				style={this.state.fullscreen ? { zIndex: 20, ...StyleSheet.absoluteFillObject, backgroundColor: "white" } : {}}
			>
				<View style={{ position: "absolute", top: this.state.scrollViewOffsetForFlying + 10, width: "30%", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", zIndex: 4, alignSelf: "center" }} ref={(ref) => (this.flying = ref)}>
					<TouchableOpacity
						style={{ backgroundColor: "white", borderRadius: 3, zIndex: 100, elevation: 5 }}
						onPress={() => {
							this.props.fullscreenChange(!this.state.fullscreen);
							this.setState({ fullscreen: !this.state.fullscreen });
						}}
					>
						{this.state.fullscreen ? <Icon name="fullscreen-exit" color="#aaaaaa" size={32} /> : <Icon name="fullscreen" color="#aaaaaa" size={32} />}
					</TouchableOpacity>
					<TouchableOpacity
						style={{
							backgroundColor: "white",
							borderRadius: 3,
							zIndex: 100,
							elevation: 5,
						}}
						onPress={() => this.scrollView.scrollTo({y: this.markers.length * 80 - 160, animated: true})}
					>
						<Icon name="chevron-down" color="#aaaaaa" size={32} style={{ backgroundColor: "white", borderRadius: 3, zIndex: 100, elevation: 5 }} />
					</TouchableOpacity>
				</View>
				<View style={{ height: this.markers.length * 80 + 240, width: "100%", zIndex: 1 }}>
					{this.props.markers.map((m, i) => (
						<Marker
							key={i}
							ref={(ref) => (this.markers[i] = ref)}
							scrollFor={(n) => {
								this.scrollView?.scrollTo({ y: this.state.scrollViewOffset + n, x: 0, animated: true });
							}}
							routeId={this.props.routeId}
							onMarkerUpdate={(markers) => {
								this.props.onMarkerUpdate(markers);
							}}
							i={i}
							markerElements={this.markers}
							markers={this.props.markers}
							map={this.props.Map}
							data={this.props.data}
							navigation={this.props.navigation}
						></Marker>
					))}
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

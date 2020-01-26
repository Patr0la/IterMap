import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

interface Props extends IProps {
	route: IRoute;
}

interface State {
	routes: Array<string>;
	routesData: Array<IRoute>;

	refreshing: boolean;
}

export class Map extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		props.route.markers.forEach((m) => {});
	}

	render() {
		return (
			<View style={{ height: 600, width: "100%" }}>
				<MapView
					style={styles.map}
					provider={PROVIDER_GOOGLE}
					initialRegion={{
						latitude: 37.78825,
						longitude: -122.4324,
						latitudeDelta: 0.0922,
						longitudeDelta: 0.0421,
					}}
				>
					<Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }}></Marker>
				</MapView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		//alignItems: "center",
		//justifyContent: "center",
		height: "100%",
	},
	textInput: {
		width: "100%",
	},
	picker: {
		height: 50,
		width: 50,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
});
